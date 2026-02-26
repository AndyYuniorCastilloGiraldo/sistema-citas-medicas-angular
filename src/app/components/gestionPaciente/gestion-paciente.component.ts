import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteResponse, PacienteRequest } from '../../models/paciente.models';
import { PacienteService } from '../../services/paciente.service';

@Component({
    selector: 'app-gestion-paciente',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './gestion-paciente.component.html',
    styleUrls: ['./gestion-paciente.component.css']
})
export class GestionPacienteComponent implements OnInit {

    private pacienteService = inject(PacienteService);
    private router = inject(Router);

    pacientes: PacienteResponse[] = [];
    filteredPacientes: PacienteResponse[] = [];

    searchTerm: string = '';

    isLoading: boolean = false;
    isSaving: boolean = false;
    errorMessage: string = '';

    successMessage: string = '';
    editSuccessMessage: string = '';

    showModal: boolean = false;
    showEditModal: boolean = false;
    showDeleteModal: boolean = false;

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

    ngOnInit(): void {
        this.cargarPacientes();
    }

    // =========================
    // CARGAR PACIENTES
    // =========================

    cargarPacientes(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.pacienteService.listar()
            .subscribe({
                next: (data) => {
                    this.pacientes = data;
                    this.applyFilter();
                    this.isLoading = false;
                },
                error: () => {
                    this.errorMessage = 'Error al cargar pacientes.';
                    this.isLoading = false;
                }
            });
    }

    applyFilter(): void {
        const term = this.searchTerm.toLowerCase();

        this.filteredPacientes = this.pacientes.filter(p => {
            return p.nombres.toLowerCase().includes(term) ||
                p.apellidos.toLowerCase().includes(term) ||
                p.dni.toLowerCase().includes(term);
        });
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
    }

    closeModal(): void {
        this.showModal = false;
        this.successMessage = '';
    }

    registrarPaciente(): void {
        if (!this.nuevoPaciente.nombres || !this.nuevoPaciente.apellidos || !this.nuevoPaciente.dni) {
            alert('Complete los campos obligatorios (Nombres, Apellidos, DNI)');
            return;
        }

        this.isSaving = true;
        this.successMessage = '';

        this.pacienteService.crear(this.nuevoPaciente)
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.successMessage = 'Paciente registrado correctamente';
                    this.cargarPacientes();
                    this.nuevoPaciente = { nombres: '', apellidos: '', dni: '', telefono: '', correo: '', direccion: '' };
                    setTimeout(() => this.successMessage = '', 3000);
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
        this.editSuccessMessage = '';
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.pacienteEditar = null;
        this.editSuccessMessage = '';
    }

    actualizarPaciente(): void {
        if (!this.pacienteEditar) return;

        const request: PacienteRequest = {
            nombres: this.pacienteEditar.nombres,
            apellidos: this.pacienteEditar.apellidos,
            dni: this.pacienteEditar.dni,
            telefono: this.pacienteEditar.telefono,
            correo: this.pacienteEditar.correo,
            direccion: this.pacienteEditar.direccion
        };

        this.isSaving = true;
        this.editSuccessMessage = '';

        this.pacienteService.actualizar(this.pacienteEditar.idPaciente, request)
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.editSuccessMessage = 'Paciente actualizado correctamente';
                    this.cargarPacientes();
                    setTimeout(() => this.editSuccessMessage = '', 3000);
                },
                error: () => {
                    this.isSaving = false;
                    alert('Error al actualizar paciente');
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
        if (this.idToDelete === null) return;

        this.pacienteService.eliminar(this.idToDelete)
            .subscribe({
                next: () => {
                    this.cargarPacientes();
                    this.closeDeleteModal();
                },
                error: () => {
                    alert('No se pudo eliminar el paciente');
                    this.closeDeleteModal();
                }
            });
    }

    volverAlDashboard(): void {
        this.router.navigate(['/']);
    }
}
