import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicoResponse, MedicoRequest } from '../../models/medico.models';
import { MedicoService } from '../../services/medico.service';
import { EspecialidadResponse } from '../../models/especialidad.models';
import { EspecialidadService } from '../../services/especialidad.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioRequest } from '../../models/usuario.models';

@Component({
  selector: 'app-gestion-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-medico.component.html',
  styleUrls: ['./gestion-medico.component.css']
})
export class GestionMedicoComponent implements OnInit {

  private medicoService = inject(MedicoService);
  private especialidadService = inject(EspecialidadService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  medicos: MedicoResponse[] = [];
  filteredMedicos: MedicoResponse[] = [];
  especialidades: EspecialidadResponse[] = [];

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

  passwordMedico: string = '';

  nuevoMedico: MedicoRequest = {
    nombres: '',
    apellidos: '',
    cmp: '',
    telefono: '',
    correo: '',       // Aquí el correo será usado como username
    idEspecialidad: 0
  };

  medicoEditar: MedicoResponse | null = null;

  ngOnInit(): void {
    this.cargarMedicos();
    this.cargarEspecialidades();
  }

  // =========================
  // CARGAR DATOS
  // =========================
  cargarMedicos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.medicoService.listar().subscribe({
      next: (data) => {
        this.medicos = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar médicos.';
        this.isLoading = false;
      }
    });
  }

  cargarEspecialidades(): void {
    this.especialidadService.listar().subscribe({
      next: (data) => this.especialidades = data,
      error: () => console.error('Error al cargar especialidades')
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredMedicos = this.medicos.filter(m =>
      m.nombres.toLowerCase().includes(term) ||
      m.apellidos.toLowerCase().includes(term) ||
      m.cmp.toLowerCase().includes(term) ||
      m.nombreEspecialidad.toLowerCase().includes(term)
    );
  }

  // =========================
  // REGISTRAR MÉDICO Y USUARIO
  // =========================
  openModal(): void {
    this.showModal = true;
    this.successMessage = '';
    this.nuevoMedico = { nombres: '', apellidos: '', cmp: '', telefono: '', correo: '', idEspecialidad: 0 };
    this.passwordMedico = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.successMessage = '';
  }

  registrarMedico(): void {

    if (!this.nuevoMedico.nombres || !this.nuevoMedico.apellidos || !this.nuevoMedico.cmp || !this.nuevoMedico.idEspecialidad) {
      alert('Complete los campos obligatorios');
      return;
    }

    if (!this.nuevoMedico.correo || !this.nuevoMedico.correo.includes('@')) {
      alert('Debe ingresar un correo válido para crear el usuario');
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    // 1️⃣ CREAR MÉDICO
    this.medicoService.crear(this.nuevoMedico).subscribe({
      next: () => {
        // 2️⃣ CREAR USUARIO con correo como username
        const usuarioReq: UsuarioRequest = {
          username: this.nuevoMedico.correo.trim(),  // ← aquí usamos correo como username
          password: this.passwordMedico?.trim() || 'Medico123*',
          rolId: 3
        };

        this.usuarioService.crear(usuarioReq).subscribe({
          next: () => {
            this.isSaving = false;
            this.successMessage =
              `Médico y usuario creados correctamente.\nUsuario: ${usuarioReq.username}\nPassword: ${usuarioReq.password}`;
            this.cargarMedicos();
            this.closeModal();
            setTimeout(() => this.successMessage = '', 8000);
          },
          error: () => {
            this.isSaving = false;
            this.errorMessage = 'Médico creado, pero error al crear usuario';
          }
        });
      },
      error: () => {
        this.isSaving = false;
        alert('Error al registrar médico');
      }
    });
  }

  // =========================
  // EDITAR MÉDICO
  // =========================
  openEditModal(medico: MedicoResponse): void {
    this.medicoEditar = { ...medico };
    this.editSuccessMessage = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.medicoEditar = null;
    this.editSuccessMessage = '';
  }

  actualizarMedico(): void {
    if (!this.medicoEditar) return;

    const request: MedicoRequest = {
      nombres: this.medicoEditar.nombres,
      apellidos: this.medicoEditar.apellidos,
      cmp: this.medicoEditar.cmp,
      telefono: this.medicoEditar.telefono,
      correo: this.medicoEditar.correo,
      idEspecialidad: this.medicoEditar.idEspecialidad
    };

    this.isSaving = true;
    this.editSuccessMessage = '';

    this.medicoService.actualizar(this.medicoEditar.idMedico, request).subscribe({
      next: () => {
        this.isSaving = false;
        this.editSuccessMessage = 'Médico actualizado correctamente';
        this.cargarMedicos();
        setTimeout(() => this.editSuccessMessage = '', 3000);
      },
      error: () => {
        this.isSaving = false;
        alert('Error al actualizar médico');
      }
    });
  }

  // =========================
  // ELIMINAR MÉDICO
  // =========================
  deleteMedico(id: number): void {
    this.idToDelete = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.idToDelete = null;
  }

  confirmDelete(): void {
    if (this.idToDelete === null) return;

    this.medicoService.eliminar(this.idToDelete).subscribe({
      next: () => {
        this.cargarMedicos();
        this.closeDeleteModal();
      },
      error: () => {
        alert('No se pudo eliminar el médico');
        this.closeDeleteModal();
      }
    });
  }

  volverAlDashboard(): void {
    this.router.navigate(['/']);
  }

}