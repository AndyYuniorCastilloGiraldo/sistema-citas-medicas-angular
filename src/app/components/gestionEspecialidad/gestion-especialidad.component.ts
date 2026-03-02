import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
    isSaving: boolean = false;
    errorMessage: string = '';

    successMessage: string = '';
    editSuccessMessage: string = '';

    showModal: boolean = false;
    showEditModal: boolean = false;
    showDeleteModal: boolean = false;

    idToDelete: number | null = null;

    nuevaEspecialidad: EspecialidadRequest = {
        nombre: '',
        descripcion: ''
    };

    especialidadEditar: EspecialidadResponse | null = null;

    ngOnInit(): void {
        this.cargarEspecialidades();
    }


    cargarEspecialidades(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.especialidadService.listar()
            .subscribe({
                next: (data) => {
                    this.especialidades = data;
                    this.applyFilter();
                    this.isLoading = false;
                },
                error: () => {
                    this.errorMessage = 'Error al cargar especialidades.';
                    this.isLoading = false;
                }
            });
    }

    applyFilter(): void {
        const term = this.searchTerm.toLowerCase();

        this.filteredEspecialidades = this.especialidades.filter(e => {
            return e.nombre.toLowerCase().includes(term) ||
                e.descripcion.toLowerCase().includes(term);
        });
    }


    openModal(): void {
        this.showModal = true;
        this.successMessage = '';
        this.nuevaEspecialidad = {
            nombre: '',
            descripcion: ''
        };
    }

    closeModal(): void {
        this.showModal = false;
        this.successMessage = '';
    }

    registrarEspecialidad(): void {
        if (!this.nuevaEspecialidad.nombre || !this.nuevaEspecialidad.descripcion) {
            alert('Complete todos los campos');
            return;
        }

        this.isSaving = true;
        this.successMessage = '';

        this.especialidadService.crear(this.nuevaEspecialidad)
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.successMessage = 'Especialidad registrada correctamente';
                    this.cargarEspecialidades();
                    this.nuevaEspecialidad = { nombre: '', descripcion: '' };
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: () => {
                    this.isSaving = false;
                    alert('Error al registrar especialidad');
                }
            });
    }


    openEditModal(especialidad: EspecialidadResponse): void {
        this.especialidadEditar = { ...especialidad };
        this.editSuccessMessage = '';
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.especialidadEditar = null;
        this.editSuccessMessage = '';
    }

    actualizarEspecialidad(): void {
        if (!this.especialidadEditar) return;

        const request: EspecialidadRequest = {
            nombre: this.especialidadEditar.nombre,
            descripcion: this.especialidadEditar.descripcion
        };

        this.isSaving = true;
        this.editSuccessMessage = '';

        this.especialidadService.actualizar(this.especialidadEditar.idEspecialidad, request)
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.editSuccessMessage = 'Especialidad actualizada correctamente';
                    this.cargarEspecialidades();
                    setTimeout(() => this.editSuccessMessage = '', 3000);
                },
                error: () => {
                    this.isSaving = false;
                    alert('Error al actualizar especialidad');
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

        this.especialidadService.eliminar(this.idToDelete)
            .subscribe({
                next: () => {
                    this.cargarEspecialidades();
                    this.closeDeleteModal();
                },
                error: () => {
                    alert('No se pudo eliminar la especialidad');
                    this.closeDeleteModal();
                }
            });
    }

    volverAlDashboard(): void {
        this.router.navigate(['/']);
    }
}
