import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteResponse, PacienteRequest } from '../../models/paciente.models';
import { PacienteService } from '../../services/paciente.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioRequest } from '../../models/usuario.models';

@Component({
    selector: 'app-gestion-paciente',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './gestion-paciente.component.html',
    styleUrls: ['./gestion-paciente.component.css']
})
export class GestionPacienteComponent implements OnInit {

    private pacienteService = inject(PacienteService);
    private usuarioService = inject(UsuarioService);
    private router = inject(Router);

    pacientes: PacienteResponse[] = [];
    filteredPacientes: PacienteResponse[] = [];
    searchTerm: string = '';

    isLoading = false;
    isSaving = false;

    errorMessage = '';
    successMessage = '';
    editSuccessMessage = '';

    showModal = false;
    showEditModal = false;
    showDeleteModal = false;

    idToDelete: number | null = null;

    nuevoPaciente: PacienteRequest = {
        nombres: '',
        apellidos: '',
        dni: '',
        telefono: '',
        correo: '',
        direccion: ''
    };

    pacienteEditar: PacienteResponse | null = null;
    passwordPaciente = '';

    ngOnInit(): void {
        this.cargarPacientes();
    }

    // =========================
    // LISTAR
    // =========================
    cargarPacientes(): void {
        this.isLoading = true;

        this.pacienteService.listar().subscribe({
            next: (data) => {
                this.pacientes = data;
                this.applyFilter();
                this.isLoading = false;
            },
            error: () => {
                this.errorMessage = 'Error al cargar pacientes';
                this.isLoading = false;
            }
        });
    }

    applyFilter(): void {
        const term = this.searchTerm.toLowerCase();
        this.filteredPacientes = this.pacientes.filter(p =>
            p.nombres.toLowerCase().includes(term) ||
            p.apellidos.toLowerCase().includes(term) ||
            p.dni.toLowerCase().includes(term)
        );
    }

    // =========================
    // REGISTRAR
    // =========================
    openModal(): void {
        this.showModal = true;
        this.successMessage = '';
        this.nuevoPaciente = {
            nombres: '',
            apellidos: '',
            dni: '',
            telefono: '',
            correo: '',
            direccion: ''
        };
        this.passwordPaciente = '';
    }

    closeModal(): void {
        this.showModal = false;
    }

    registrarPaciente(): void {

        // 🔥 NORMALIZAR CORREO (CLAVE DEL PROBLEMA)
        this.nuevoPaciente.correo = this.nuevoPaciente.correo
            .trim()
            .toLowerCase();

        if (!this.nuevoPaciente.correo.includes('@')) {
            alert('Correo inválido');
            return;
        }

        if (!this.nuevoPaciente.nombres || !this.nuevoPaciente.apellidos ||
            !this.nuevoPaciente.dni || !this.nuevoPaciente.correo) {
            alert('Complete los campos obligatorios');
            return;
        }

        if (this.passwordPaciente && this.passwordPaciente.includes(' ')) {
            alert('La contraseña no debe tener espacios');
            return;
        }

        this.isSaving = true;

        // 1️⃣ CREAR PACIENTE
        this.pacienteService.crear(this.nuevoPaciente).subscribe({
            next: () => {

                // 2️⃣ CREAR USUARIO (MISMO CORREO = EMAIL)
                const usuarioReq: UsuarioRequest = {
                    username: this.nuevoPaciente.nombres,
                    email: this.nuevoPaciente.correo,
                    password: this.passwordPaciente?.trim() || 'Paciente123*',
                    rolId: 2
                };

                this.usuarioService.crear(usuarioReq).subscribe({
                    next: () => {
                        this.isSaving = false;
                        this.successMessage =
                            `Paciente y usuario creados correctamente.
Email: ${usuarioReq.email}
Password: ${usuarioReq.password}`;

                        this.cargarPacientes();
                        this.closeModal();

                        setTimeout(() => this.successMessage = '', 8000);
                    },
                    error: () => {
                        this.isSaving = false;
                        this.errorMessage =
                            'Paciente creado, pero error al crear usuario';
                    }
                });
            },
            error: () => {
                this.isSaving = false;
                alert('Error al registrar paciente');
            }
        });
    }

    // =========================
    // EDITAR
    // =========================
    openEditModal(paciente: PacienteResponse): void {
        this.pacienteEditar = { ...paciente };
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.pacienteEditar = null;
    }

    actualizarPaciente(): void {
        if (!this.pacienteEditar) return;

        const req: PacienteRequest = {
            nombres: this.pacienteEditar.nombres,
            apellidos: this.pacienteEditar.apellidos,
            dni: this.pacienteEditar.dni,
            telefono: this.pacienteEditar.telefono,
            correo: this.pacienteEditar.correo.trim().toLowerCase(),
            direccion: this.pacienteEditar.direccion
        };

        this.isSaving = true;

        this.pacienteService.actualizar(this.pacienteEditar.idPaciente, req)
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.editSuccessMessage = 'Paciente actualizado';
                    this.cargarPacientes();
                    setTimeout(() => this.editSuccessMessage = '', 3000);
                },
                error: () => {
                    this.isSaving = false;
                    alert('Error al actualizar');
                }
            });
    }

    // =========================
    // ELIMINAR
    // =========================
    deletePaciente(id: number): void {
        this.idToDelete = id;
        this.showDeleteModal = true;
    }

    closeDeleteModal(): void {
        this.showDeleteModal = false;
        this.idToDelete = null;
    }

    confirmDelete(): void {
        if (!this.idToDelete) return;

        this.pacienteService.eliminar(this.idToDelete).subscribe({
            next: () => {
                this.cargarPacientes();
                this.closeDeleteModal();
            },
            error: () => {
                alert('No se pudo eliminar');
                this.closeDeleteModal();
            }
        });
    }

    volverAlDashboard(): void {
        this.router.navigate(['/']);
    }
}