import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CitaResponse, CitaRequest } from '../../models/cita.models';
import { CitaService } from '../../services/cita.service';
import { PacienteResponse } from '../../models/paciente.models';
import { PacienteService } from '../../services/paciente.service';
import { MedicoResponse } from '../../models/medico.models';
import { MedicoService } from '../../services/medico.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
    selector: 'app-gestion-cita',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './gestion-cita.component.html',
    styleUrls: ['./gestion-cita.component.css']
})
export class GestionCitaComponent implements OnInit {

    private citaService = inject(CitaService);
    private pacienteService = inject(PacienteService);
    private medicoService = inject(MedicoService);
    private usuarioService = inject(UsuarioService);
    private authService = inject(AuthService);
    private router = inject(Router);

    citas: CitaResponse[] = [];
    filteredCitas: CitaResponse[] = [];
    pacientes: PacienteResponse[] = [];
    medicos: MedicoResponse[] = [];

    currentUserId: number | null = null;
    currentPatientId: number | null = null;
    currentMedicoId: number | null = null;
    isPatient: boolean = false;
    isMedico: boolean = false;
    userName: string = '';
    patientName: string = '';
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

    nuevaCita: CitaRequest = {
        fecha: '',
        hora: '',
        motivo: '',
        observaciones: '',
        idPaciente: 0,
        idMedico: 0,
        idUsuario: 0
    };

    citaEditar: CitaResponse | null = null;

    ngOnInit(): void {
        this.cargarDatos();
        this.obtenerUsuarioActual();
    }

    // =========================
    // CARGAR DATOS
    // =========================

    cargarDatos(): void {
        this.isLoading = true;
        this.errorMessage = '';

        // Cargar Citas
        this.citaService.listar().subscribe({
            next: (data) => {
                this.citas = data;
                this.applyFilter();
                this.isLoading = false;
            },
            error: () => {
                this.errorMessage = 'Error al cargar citas.';
                this.isLoading = false;
            }
        });

        // Cargar Pacientes y Médicos para los selects
        this.pacienteService.listar().subscribe(data => this.pacientes = data);
        this.medicoService.listar().subscribe(data => this.medicos = data);
    }

    obtenerUsuarioActual(): void {
        const username = this.authService.getUsername();
        const role = this.authService.getRole();
        // Aceptar tanto USUARIO como PACIENTE como roles de paciente
        this.isPatient = role === 'USUARIO' || role === 'PACIENTE';
        this.isMedico = role === 'MEDICO';

        if (username) {
            this.userName = username;
            this.usuarioService.listar().subscribe(usuarios => {
                const user = usuarios.find(u => u.email?.toLowerCase().trim() === username.toLowerCase().trim() || u.username?.toLowerCase().trim() === username.toLowerCase().trim());
                if (user) {
                    this.currentUserId = user.idUsuario;
                    this.nuevaCita.idUsuario = user.idUsuario;

                    if (this.isPatient) {
                        this.pacienteService.listar().subscribe(pacientes => {
                            console.log('Buscando paciente para:', username);
                            console.log('Pacientes disponibles:', pacientes);

                            let found = pacientes.find(p =>
                                p.correo?.toLowerCase().trim() === username.toLowerCase().trim()
                            );

                            // Fallback: si no coincide por correo, intentar por nombres (menos preciso)
                            if (!found) {
                                found = pacientes.find(p =>
                                    username.toLowerCase().includes(p.nombres.toLowerCase()) ||
                                    username.toLowerCase().includes(p.apellidos.toLowerCase())
                                );
                            }

                            if (found) {
                                this.currentPatientId = found.idPaciente;
                                this.patientName = `${found.nombres} ${found.apellidos}`;
                                console.log('Paciente vinculado:', this.patientName, 'ID:', this.currentPatientId);
                                this.applyFilter();
                                // Si el modal ya estaba "pendiente" de cargar datos, lo abrimos
                                if (this.showModal && !this.nuevaCita.idPaciente) {
                                    this.nuevaCita.idPaciente = found.idPaciente;
                                }
                            } else {
                                console.warn('No se encontró paciente para:', username);
                            }
                        });
                    } else if (this.isMedico) {
                        // Si es médico, buscar su ID de médico
                        this.medicoService.listar().subscribe(medicos => {
                            const found = medicos.find(m =>
                                m.correo?.toLowerCase().trim() === username.toLowerCase().trim()
                            );
                            if (found) {
                                this.currentMedicoId = found.idMedico;
                                console.log('Médico vinculado ID:', this.currentMedicoId);
                                this.applyFilter();
                            }
                        });
                    }
                }
            });
        }
    }

    applyFilter(): void {
        const term = this.searchTerm.toLowerCase();

        this.filteredCitas = this.citas.filter(c => {
            // Filtro por Rol:
            // Pacientes solo ven sus propias citas
            const matchesPatient = !this.isPatient || (this.currentPatientId !== null && c.idPaciente === this.currentPatientId);
            // Médicos solo ven sus propias citas
            const matchesMedico = !this.isMedico || (this.currentMedicoId !== null && c.idMedico === this.currentMedicoId);

            const matchesTerm = c.nombrePaciente.toLowerCase().includes(term) ||
                c.nombreMedico.toLowerCase().includes(term) ||
                c.motivo.toLowerCase().includes(term) ||
                c.estado.toLowerCase().includes(term);

            return matchesPatient && matchesMedico && matchesTerm;
        });
    }

    // =========================
    // REGISTRAR
    // =========================

    openModal(): void {
        this.showModal = true;
        this.successMessage = '';

        if (this.isPatient && !this.currentPatientId) {
            // Intentar cargar de nuevo si no está listo
            this.obtenerUsuarioActual();
        }
        this.nuevaCita = {
            fecha: '',
            hora: '',
            motivo: '',
            observaciones: '',
            idPaciente: this.currentPatientId || 0,
            idMedico: 0,
            idUsuario: this.currentUserId || 0
        };
    }

    closeModal(): void {
        this.showModal = false;
        this.successMessage = '';
    }

    registrarCita(): void {
        // Asegurar que los IDs estén sincronizados antes de validar
        if (this.isPatient && !this.nuevaCita.idPaciente && this.currentPatientId) {
            this.nuevaCita.idPaciente = this.currentPatientId;
        }
        if (!this.nuevaCita.idUsuario && this.currentUserId) {
            this.nuevaCita.idUsuario = this.currentUserId;
        }

        // Validación detallada
        const missing = [];
        if (!this.nuevaCita.fecha) missing.push('Fecha');
        if (!this.nuevaCita.hora) missing.push('Hora');
        if (!this.nuevaCita.idPaciente) missing.push('Paciente (ID no cargado)');
        if (!this.nuevaCita.idMedico) missing.push('Médico');

        if (missing.length > 0) {
            alert('Por favor complete los siguientes campos: ' + missing.join(', '));
            return;
        }

        this.isSaving = true;
        this.successMessage = '';

        this.citaService.crear(this.nuevaCita)
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.successMessage = 'Cita registrada correctamente';
                    this.cargarDatos();
                    this.nuevaCita = { fecha: '', hora: '', motivo: '', observaciones: '', idPaciente: 0, idMedico: 0, idUsuario: this.currentUserId || 0 };
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: () => {
                    this.isSaving = false;
                    alert('Error al registrar cita. Verifique la disponibilidad.');
                }
            });
    }

    // =========================
    // EDITAR / CANCELAR
    // =========================

    openEditModal(cita: CitaResponse): void {
        this.citaEditar = { ...cita };
        this.editSuccessMessage = '';
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.citaEditar = null;
        this.editSuccessMessage = '';
    }

    actualizarCita(): void {
        if (!this.citaEditar) return;

        const request: CitaRequest = {
            fecha: this.citaEditar.fecha,
            hora: this.citaEditar.hora,
            motivo: this.citaEditar.motivo,
            observaciones: this.citaEditar.observaciones,
            idPaciente: this.citaEditar.idPaciente,
            idMedico: this.citaEditar.idMedico,
            idUsuario: this.citaEditar.idUsuario
        };

        this.isSaving = true;
        this.editSuccessMessage = '';

        this.citaService.actualizar(this.citaEditar.idCita, request)
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.editSuccessMessage = 'Cita actualizada correctamente';
                    this.cargarDatos();
                    setTimeout(() => this.editSuccessMessage = '', 3000);
                },
                error: () => {
                    this.isSaving = false;
                    alert('Error al actualizar cita');
                }
            });
    }

    cancelarCita(id: number): void {
        if (confirm('¿Desea cancelar esta cita?')) {
            this.citaService.cancelar(id).subscribe({
                next: () => this.cargarDatos(),
                error: () => alert('No se pudo cancelar la cita')
            });
        }
    }

    atenderCita(id: number): void {
        if (confirm('¿Desea marcar esta cita como ATENDIDA?')) {
            this.citaService.atender(id).subscribe({
                next: () => this.cargarDatos(),
                error: () => alert('Error al procesar la cita')
            });
        }
    }

    // =========================
    // AUXILIARES
    // =========================

    getStatusClass(estado: string): string {
        const e = estado.toLowerCase();
        if (e.includes('pendiente')) return 'status-pending';
        if (e.includes('completada') || e.includes('asistio')) return 'status-completed';
        if (e.includes('cancelada')) return 'status-cancelled';
        return '';
    }

    volverAlDashboard(): void {
        this.router.navigate(['/']);
    }
}