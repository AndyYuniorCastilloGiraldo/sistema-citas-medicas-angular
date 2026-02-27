import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioResponse, UsuarioRequest } from '../../models/usuario.models';
import { UsuarioService } from '../../services/usuario.service';
import { MedicoService } from '../../services/medico.service';
import { PacienteService } from '../../services/paciente.service';
import { MedicoResponse } from '../../models/medico.models';
import { PacienteResponse } from '../../models/paciente.models';
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
    private router = inject(Router);

    usuarios: UsuarioResponse[] = [];
    filteredUsuarios: UsuarioResponse[] = [];
    medicos: MedicoResponse[] = [];
    pacientes: PacienteResponse[] = [];

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

    nuevoUsuario: UsuarioRequest = {
        username: '',
        password: '',
        rolId: null
    };

    usuarioEditar: UsuarioResponse | null = null;

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
            pacientes: this.pacienteService.listar()
        }).subscribe({
            next: (data) => {
                this.usuarios = data.usuarios;
                this.medicos = data.medicos;
                this.pacientes = data.pacientes;
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
        this.nuevoUsuario = { username: '', password: '', rolId: null };
    }

    closeModal(): void {
        this.showModal = false;
    }

    registrarUsuario(): void {
        if (!this.nuevoUsuario.username ||
            !this.nuevoUsuario.password ||
            this.nuevoUsuario.rolId === null) {
            alert('Complete todos los campos');
            return;
        }

        this.isSaving = true;
        this.successMessage = '';

        this.usuarioService.crear(this.nuevoUsuario)
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.successMessage = 'Usuario registrado correctamente';
                    this.cargarUsuarios();

                    // Limpiar campos pero mantener modal abierto
                    this.nuevoUsuario = { username: '', password: '', rolId: null };

                    // Opcional: limpiar mensaje después de unos segundos
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: () => {
                    this.isSaving = false;
                    alert('Error al crear usuario');
                }
            });
    }

    // =========================
    // EDITAR
    // =========================

    openEditModal(usuario: UsuarioResponse): void {
        this.usuarioEditar = { ...usuario };
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.usuarioEditar = null;
    }

    actualizarUsuario(): void {
        if (!this.usuarioEditar) return;

        if (this.usuarioEditar.rolId == null) {
            alert('Seleccione un rol');
            return;
        }

        const request: UsuarioRequest = {
            username: this.usuarioEditar.username,
            rolId: this.usuarioEditar.rolId,
            password: undefined
        };

        this.isSaving = true;
        this.editSuccessMessage = '';

        this.usuarioService.actualizar(
            this.usuarioEditar.idUsuario,
            request
        )
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.editSuccessMessage = 'Usuario actualizado correctamente';
                    this.cargarUsuarios();

                    // Limpiar campos de edición (opcional, según preferencia)
                    this.usuarioEditar!.username = '';
                    this.usuarioEditar!.rolId = null;

                    setTimeout(() => this.editSuccessMessage = '', 3000);
                },
                error: () => {
                    this.isSaving = false;
                    alert('Error al actualizar usuario');
                }
            });
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