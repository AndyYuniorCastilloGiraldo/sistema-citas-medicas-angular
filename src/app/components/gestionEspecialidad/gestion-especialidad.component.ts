import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { EspecialidadResponse, EspecialidadRequest } from '../../models/especialidad.models';
import { EspecialidadService } from '../../services/especialidad.service';

@Component({
    selector: 'app-gestion-especialidad',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './gestion-especialidad.component.html',
    styleUrls: ['./gestion-especialidad.component.css']
})
export class GestionEspecialidadComponent implements OnInit {
    private especialidadService = inject(EspecialidadService);
    private router = inject(Router);

    especialidades: EspecialidadResponse[] = [];
    filteredEspecialidades: EspecialidadResponse[] = [];
    searchTerm: string = '';
    isLoading: boolean = false;
    errorMessage: string = '';

    // Modal State
    showModal: boolean = false;
    showDeleteModal: boolean = false;
    isSaving: boolean = false;
    isEditing: boolean = false;
    selectedEspecialidadId: number | null = null;
    idToDelete: number | null = null;

    nuevaEspecialidad: EspecialidadRequest = {
        nombre: '',
        descripcion: ''
    };

    ngOnInit(): void {
        this.cargarEspecialidades();
    }

    cargarEspecialidades(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.especialidadService.listar().pipe(
            finalize(() => this.isLoading = false)
        ).subscribe({
            next: (data) => {
                this.especialidades = Array.isArray(data) ? data : [];
                this.applyFilter();
            },
            error: (err) => {
                console.error(err);
                this.errorMessage = 'Error al cargar especialidades.';
            }
        });
    }

    applyFilter(): void {
        const term = this.searchTerm.toLowerCase();
        this.filteredEspecialidades = this.especialidades.filter(e =>
            e.nombre.toLowerCase().includes(term) ||
            e.descripcion.toLowerCase().includes(term)
        );
    }

    openModal(especialidad?: EspecialidadResponse): void {
        this.showModal = true;
        if (especialidad) {
            this.isEditing = true;
            this.selectedEspecialidadId = especialidad.idEspecialidad;
            this.nuevaEspecialidad = {
                nombre: especialidad.nombre,
                descripcion: especialidad.descripcion
            };
        } else {
            this.isEditing = false;
            this.selectedEspecialidadId = null;
            this.nuevaEspecialidad = {
                nombre: '',
                descripcion: ''
            };
        }
    }

    closeModal(): void {
        this.showModal = false;
    }

    volverAlDashboard(): void {
        this.router.navigate(['/']);
    }

    guardarEspecialidad(): void {
        if (!this.nuevaEspecialidad.nombre) return;

        this.isSaving = true;
        const request = this.isEditing && this.selectedEspecialidadId
            ? this.especialidadService.actualizar(this.selectedEspecialidadId, this.nuevaEspecialidad)
            : this.especialidadService.crear(this.nuevaEspecialidad);

        request.pipe(
            finalize(() => this.isSaving = false)
        ).subscribe({
            next: () => {
                this.showModal = false;
                this.cargarEspecialidades();
            },
            error: (err) => {
                console.error('Error saving specialty:', err);
                alert('Error al guardar especialidad. Inténtelo de nuevo.');
            }
        });
    }

    deleteEspecialidad(id: number): void {
        this.idToDelete = id;
        this.showDeleteModal = true;
    }

    closeDeleteModal(): void {
        this.showDeleteModal = false;
        this.idToDelete = null;
    }

    confirmDelete(): void {
        if (this.idToDelete === null) return;

        this.especialidadService.eliminar(this.idToDelete).subscribe({
            next: () => {
                this.especialidades = this.especialidades.filter(e => e.idEspecialidad !== this.idToDelete);
                this.applyFilter();
                this.closeDeleteModal();
            },
            error: (err) => {
                console.error('Error deleting specialty:', err);
                alert('No se pudo eliminar la especialidad.');
                this.closeDeleteModal();
            }
        });
    }
}
