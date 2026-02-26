import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
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
    errorMessage: string = '';

    // Modal State
    showModal: boolean = false;
    showDeleteModal: boolean = false;
    isSaving: boolean = false;
    isEditing: boolean = false;
    selectedPacienteId: number | null = null;
    idToDelete: number | null = null;

    nuevoPaciente: PacienteRequest = {
        nombres: '',
        apellidos: '',
        dni: '',
        telefono: '',
        correo: '',
        direccion: ''
    };

    ngOnInit(): void {
        this.cargarPacientes();
    }

    cargarPacientes(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.pacienteService.listar().pipe(
            finalize(() => this.isLoading = false)
        ).subscribe({
            next: data => {
                this.pacientes = Array.isArray(data) ? data : [];
                this.applyFilter();
            },
            error: () => {
                this.errorMessage = 'Error al cargar pacientes';
            }
        });
    }

    applyFilter(): void {
        const term = (this.searchTerm || '').toLowerCase();
        this.filteredPacientes = this.pacientes.filter(p =>
            (p.nombres || '').toLowerCase().includes(term) ||
            (p.apellidos || '').toLowerCase().includes(term) ||
            (p.dni || '').includes(term) ||
            (p.correo || '').toLowerCase().includes(term)
        );
    }

    openModal(paciente?: PacienteResponse): void {
        this.showModal = true;

        if (paciente) {
            this.isEditing = true;
            this.selectedPacienteId = paciente.idPaciente;
            this.nuevoPaciente = {
                nombres: paciente.nombres,
                apellidos: paciente.apellidos,
                dni: paciente.dni,
                telefono: paciente.telefono ?? '',
                correo: paciente.correo ?? '',
                direccion: paciente.direccion ?? ''
            };
        } else {
            this.isEditing = false;
            this.selectedPacienteId = null;
            this.nuevoPaciente = {
                nombres: '',
                apellidos: '',
                dni: '',
                telefono: '',
                correo: '',
                direccion: ''
            };
        }
    }

    closeModal(): void {
        this.showModal = false;
    }

    guardarPaciente(): void {
        if (!this.nuevoPaciente.nombres || !this.nuevoPaciente.apellidos || !this.nuevoPaciente.dni) return;

        this.isSaving = true;
        const request = this.isEditing && this.selectedPacienteId
            ? this.pacienteService.actualizar(this.selectedPacienteId, this.nuevoPaciente)
            : this.pacienteService.crear(this.nuevoPaciente);

        request.pipe(
            finalize(() => this.isSaving = false)
        ).subscribe({
            next: () => {
                alert('¡Registro exitoso! El paciente ha sido guardado.');
                this.showModal = false;
                this.cargarPacientes();
            },
            error: (err) => {
                console.error('Error saving patient:', err);
                alert('Error al guardar paciente. Inténtelo de nuevo.');
            }
        });
    }

    deletePaciente(id: number): void {
        this.idToDelete = id;
        this.showDeleteModal = true;
    }

    confirmDelete(): void {
        if (!this.idToDelete) return;

        this.pacienteService.eliminar(this.idToDelete).subscribe({
            next: () => {
                this.showDeleteModal = false;
                this.cargarPacientes();
            },
            error: () => alert('No se pudo eliminar el paciente')
        });
    }

    closeDeleteModal(): void {
        this.showDeleteModal = false;
        this.idToDelete = null;
    }

    volverAlDashboard(): void {
        this.router.navigate(['/']);
    }
}