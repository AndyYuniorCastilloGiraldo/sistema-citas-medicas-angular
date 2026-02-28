import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioResponse, UsuarioRequest } from '../../models/usuario.models';
import { UsuarioService } from '../../services/usuario.service';
import { MedicoService } from '../../services/medico.service';
import { PacienteService } from '../../services/paciente.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { MedicoResponse, MedicoRequest } from '../../models/medico.models';
import { PacienteResponse, PacienteRequest } from '../../models/paciente.models';
import { EspecialidadResponse } from '../../models/especialidad.models';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-gestion-usuario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './gestion-usuario.component.html',
    styleUrls: ['./gestion-usuario.component.css']
})
export class GestionUsuarioComponent implements OnInit {

    private usuarioService = inject(UsuarioService);
    private medicoService = inject(MedicoService);
    private pacienteService = inject(PacienteService);
    private especialidadService = inject(EspecialidadService);
    private router = inject(Router);

    usuarios: UsuarioResponse[] = [];
    filteredUsuarios: UsuarioResponse[] = [];
    medicos: MedicoResponse[] = [];
    pacientes: PacienteResponse[] = [];
    especialidades: EspecialidadResponse[] = [];

    searchTerm: string = '';
    selectedRole: string = '';

    isLoading: boolean = false;
    isSaving: boolean = false;
    errorMessage: string = '';

    successMessage: string = '';
    editSuccessMessage: string = '';

    showModal: boolean = false;
    showEditModal: boolean = false;
    showDeleteModal: boolean = false;

    idToDelete: number | null = null;

    nuevoUsuario: UsuarioRequest = { username: '', email: '', password: '', rolId: null };
    nuevoPaciente: PacienteRequest = { nombres: '', apellidos: '', dni: '', telefono: '', correo: '', direccion: '' };
    nuevoMedico: MedicoRequest = { nombres: '', apellidos: '', cmp: '', telefono: '', correo: '', idEspecialidad: 0 };

    usuarioEditar: UsuarioResponse | null = null;
    pacienteEditar: PacienteResponse | null = null;
    medicoEditar: MedicoResponse | null = null;

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    // =========================
    // CARGAR USUARIOS
    // =========================

    cargarUsuarios(): void {
        this.isLoading = true;
        this.errorMessage = '';

        forkJoin({
            usuarios: this.usuarioService.listar(),
            medicos: this.medicoService.listar(),
            pacientes: this.pacienteService.listar(),
            especialidades: this.especialidadService.listar()
        }).subscribe({
            next: (data) => {
                this.usuarios = data.usuarios;
                this.medicos = data.medicos;
                this.pacientes = data.pacientes;
                this.especialidades = data.especialidades;
                this.applyFilter();
                this.isLoading = false;
            },
            error: () => {
                this.errorMessage = 'Error al cargar usuarios o datos relacionados.';
                this.isLoading = false;
            }
        });
    }

    getNombreReal(username: string): string {
        const u = username.toLowerCase().trim();

        // Buscar en médicos
        const medico = this.medicos.find(m =>
            m.correo?.toLowerCase().trim() === u ||
            m.cmp?.toLowerCase().trim() === u
        );
        if (medico) return `${medico.nombres} ${medico.apellidos}`;

        // Buscar en pacientes
        const paciente = this.pacientes.find(p => p.correo?.toLowerCase().trim() === u);
        if (paciente) return `${paciente.nombres} ${paciente.apellidos}`;

        return 'No vinculado';
    }

    applyFilter(): void {
        const term = this.searchTerm.toLowerCase();
        const role = this.selectedRole.toLowerCase();

        this.filteredUsuarios = this.usuarios.filter(u => {
            const roleName = u.rolNombre.replace('ROLE_', '').toLowerCase();

            const matchesSearch =
                u.username.toLowerCase().includes(term) ||
                roleName.includes(term);

            const matchesRole =
                !this.selectedRole || roleName === role;

            return matchesSearch && matchesRole;
        });
    }

    // =========================
    // REGISTRAR
    // =========================

    openModal(): void {
        this.showModal = true;
        this.nuevoUsuario = { username: '', email: '', password: '', rolId: null };
        this.nuevoPaciente = { nombres: '', apellidos: '', dni: '', telefono: '', correo: '', direccion: '' };
        this.nuevoMedico = { nombres: '', apellidos: '', cmp: '', telefono: '', correo: '', idEspecialidad: 0 };
    }

    closeModal(): void {
        this.showModal = false;
    }

    registrarUsuario(): void {
        if (!this.nuevoUsuario.username ||
            !this.nuevoUsuario.email ||
            !this.nuevoUsuario.password ||
            this.nuevoUsuario.rolId === null) {
            alert('Complete los campos básicos del usuario/login');
            return;
        }

        this.isSaving = true;
        this.successMessage = '';

        const finalizeUserCreation = () => {
            this.usuarioService.crear(this.nuevoUsuario)
                .subscribe({
                    next: () => {
                        this.isSaving = false;
                        this.successMessage = 'Usuario registrado correctamente';
                        this.cargarUsuarios();
                        this.nuevoUsuario = { username: '', email: '', password: '', rolId: null };
                        setTimeout(() => this.successMessage = '', 3000);
                    },
                    error: () => {
                        this.isSaving = false;
                        alert('Error al crear credenciales de usuario');
                    }
                });
        };

        if (this.nuevoUsuario.rolId === 2) { // Paciente
            this.nuevoPaciente.correo = this.nuevoUsuario.email;
            this.nuevoPaciente.nombres = this.nuevoUsuario.username;
            if (!this.nuevoPaciente.apellidos || !this.nuevoPaciente.dni) {
                alert('Complete los datos obligatorios del paciente (Apellidos, DNI)');
                this.isSaving = false;
                return;
            }
            this.pacienteService.crear(this.nuevoPaciente).subscribe({
                next: () => finalizeUserCreation(),
                error: () => { this.isSaving = false; alert('Error al crear perfil de paciente'); }
            });
        } else if (this.nuevoUsuario.rolId === 3) { // Medico
            this.nuevoMedico.correo = this.nuevoUsuario.email;
            this.nuevoMedico.nombres = this.nuevoUsuario.username;
            if (!this.nuevoMedico.apellidos || !this.nuevoMedico.cmp || !this.nuevoMedico.idEspecialidad) {
                alert('Complete los datos obligatorios del médico (Apellidos, CMP, Especialidad)');
                this.isSaving = false;
                return;
            }
            this.medicoService.crear(this.nuevoMedico).subscribe({
                next: () => finalizeUserCreation(),
                error: () => { this.isSaving = false; alert('Error al crear perfil de médico'); }
            });
        } else {
            finalizeUserCreation();
        }
    }

    // =========================
    // EDITAR
    // =========================

    openEditModal(usuario: UsuarioResponse): void {
        this.usuarioEditar = { ...usuario };
        this.pacienteEditar = null;
        this.medicoEditar = null;

        const uEmail = usuario.email?.toLowerCase().trim();
        const uName = usuario.username.toLowerCase().trim();

        if (usuario.rolNombre === 'ROLE_PACIENTE') {
            const p = this.pacientes.find(x => x.correo?.toLowerCase().trim() === uEmail || x.correo?.toLowerCase().trim() === uName);
            if (p) this.pacienteEditar = { ...p };
        } else if (usuario.rolNombre === 'ROLE_MEDICO') {
            const m = this.medicos.find(x => x.correo?.toLowerCase().trim() === uEmail || x.correo?.toLowerCase().trim() === uName);
            if (m) this.medicoEditar = { ...m };
        }

        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.usuarioEditar = null;
        this.pacienteEditar = null;
        this.medicoEditar = null;
    }

    actualizarUsuario(): void {
        if (!this.usuarioEditar) return;
        if (this.usuarioEditar.rolId == null) { alert('Seleccione un rol'); return; }

        const request: UsuarioRequest = {
            username: this.usuarioEditar.username,
            email: this.usuarioEditar.email || '',
            rolId: this.usuarioEditar.rolId,
            password: undefined
        };

        this.isSaving = true;
        this.editSuccessMessage = '';

        const finalizeUpdate = () => {
            this.usuarioService.actualizar(this.usuarioEditar!.idUsuario, request)
                .subscribe({
                    next: () => {
                        this.isSaving = false;
                        this.editSuccessMessage = 'Usuario actualizado correctamente';
                        this.cargarUsuarios();
                        setTimeout(() => this.editSuccessMessage = '', 3000);
                    },
                    error: () => {
                        this.isSaving = false;
                        alert('Error al actualizar credenciales');
                    }
                });
        };

        if (this.usuarioEditar.rolNombre === 'ROLE_PACIENTE' && this.pacienteEditar) {
            this.pacienteEditar.correo = this.usuarioEditar.email || '';
            this.pacienteEditar.nombres = this.usuarioEditar.username;
            this.pacienteService.actualizar(this.pacienteEditar.idPaciente, this.pacienteEditar).subscribe({
                next: () => finalizeUpdate(),
                error: () => { this.isSaving = false; alert('Error al actualizar datos de paciente'); }
            });
        } else if (this.usuarioEditar.rolNombre === 'ROLE_MEDICO' && this.medicoEditar) {
            this.medicoEditar.correo = this.usuarioEditar.email || '';
            this.medicoEditar.nombres = this.usuarioEditar.username;
            this.medicoService.actualizar(this.medicoEditar.idMedico, this.medicoEditar).subscribe({
                next: () => finalizeUpdate(),
                error: () => { this.isSaving = false; alert('Error al actualizar datos de médico'); }
            });
        } else {
            finalizeUpdate();
        }
    }

    // =========================
    // CAMBIAR ESTADO
    // =========================

    toggleEstado(usuario: UsuarioResponse): void {
        const nuevoEstado = !usuario.estado;

        this.usuarioService
            .cambiarEstado(usuario.idUsuario, nuevoEstado)
            .subscribe({
                next: () => usuario.estado = nuevoEstado,
                error: () => alert('Error al cambiar estado')
            });
    }

    // =========================
    // ELIMINAR
    // =========================

    deleteUsuario(id: number): void {
        this.idToDelete = id;
        this.showDeleteModal = true;
    }

    closeDeleteModal(): void {
        this.showDeleteModal = false;
        this.idToDelete = null;
    }

    confirmDelete(): void {
        if (this.idToDelete === null) return;

        this.usuarioService.eliminar(this.idToDelete)
            .subscribe({
                next: () => {
                    this.usuarios = this.usuarios.filter(
                        u => u.idUsuario !== this.idToDelete
                    );
                    this.applyFilter();
                    this.closeDeleteModal();
                },
                error: () => {
                    alert('No se pudo eliminar');
                    this.closeDeleteModal();
                }
            });
    }

    // =========================
    // NAVEGACIÓN
    // =========================

    volverAlDashboard(): void {
        this.router.navigate(['/']);
    }
}