import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../services/cita.service';
import { MedicoService } from '../../services/medico.service';
import { AuthService } from '../../services/auth.service';
import { CitaResponse } from '../../models/cita.models';
import { MedicoResponse } from '../../models/medico.models';

@Component({
    selector: 'app-medico-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './medico-dashboard.component.html',
    styleUrl: './medico-dashboard.component.css'
})
export class MedicoDashboardComponent implements OnInit {
    private citaService = inject(CitaService);
    private medicoService = inject(MedicoService);
    private authService = inject(AuthService);

    citas: CitaResponse[] = [];
    currentMedico: MedicoResponse | null = null;
    isLoading: boolean = true;

    stats = {
        citasHoy: 0,
        totalPacientes: 0,
        calificacion: 4.9
    };

    ngOnInit(): void {
        this.cargarDatos();
    }

    cargarDatos(): void {
        const username = this.authService.getUsername();
        if (!username) return;

        this.medicoService.listar().subscribe({
            next: (medicos) => {
                // Buscar médico por correo o CMP (según cómo se creó el usuario)
                this.currentMedico = medicos.find(m => m.correo === username || m.cmp === username) || null;

                if (this.currentMedico) {
                    this.cargarCitas(this.currentMedico.idMedico);
                } else {
                    this.isLoading = false;
                }
            },
            error: () => this.isLoading = false
        });
    }

    cargarCitas(idMedico: number): void {
        this.citaService.listar().subscribe({
            next: (allCitas) => {
                // Filtrar citas del médico y que no estén canceladas
                this.citas = allCitas.filter(c => c.idMedico === idMedico && c.estado !== 'CANCELADA');

                // Calcular stats
                const hoy = new Date().toISOString().split('T')[0];
                this.stats.citasHoy = this.citas.filter(c => c.fecha === hoy && c.estado === 'PENDIENTE').length;

                // Total de pacientes únicos
                const pacientesUnicos = new Set(this.citas.map(c => c.idPaciente));
                this.stats.totalPacientes = pacientesUnicos.size;

                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    atenderCita(idCita: number): void {
        if (confirm('¿Desea marcar esta cita como ATENDIDA?')) {
            this.citaService.atender(idCita).subscribe({
                next: () => {
                    alert('Cita atendida correctamente');
                    if (this.currentMedico) {
                        this.cargarCitas(this.currentMedico.idMedico);
                    }
                },
                error: () => alert('Error al procesar la cita')
            });
        }
    }

    getStatusClass(estado: string): string {
        const e = estado.toLowerCase();
        if (e.includes('pendiente')) return 'status-pending';
        if (e.includes('atendido') || e.includes('completada')) return 'status-completed';
        if (e.includes('cancelada')) return 'status-cancelled';
        return '';
    }
}
