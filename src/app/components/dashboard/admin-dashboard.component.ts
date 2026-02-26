import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsuarioService } from '../../services/usuario.service';
import { CitaService } from '../../services/cita.service';
import { PacienteService } from '../../services/paciente.service';
import { CitaResponse } from '../../models/cita.models';
import { UsuarioResponse } from '../../models/usuario.models';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
    private usuarioService = inject(UsuarioService);
    private pacienteService = inject(PacienteService);
    private citaService = inject(CitaService);

    totalUsuarios: number = 0;
    totalPacientes: number = 0;
    totalCitas: number = 0;
    citasRecientes: CitaResponse[] = [];
    isLoading: boolean = true;

    ngOnInit(): void {
        this.cargarEstadisticas();
    }

    cargarEstadisticas(): void {
        this.isLoading = true;

        forkJoin({
            usuarios: this.usuarioService.listar().pipe(catchError(err => {
                console.error('Error usuarios:', err);
                return of([]);
            })),
            pacientes: this.pacienteService.listar().pipe(catchError(err => {
                console.error('Error pacientes:', err);
                return of([]);
            })),
            citas: this.citaService.listar().pipe(catchError(err => {
                console.error('Error citas:', err);
                return of([]);
            }))
        }).subscribe({
            next: (results) => {
                this.totalUsuarios = results.usuarios.length;
                this.totalPacientes = results.pacientes.length;
                this.totalCitas = results.citas.length;
                this.citasRecientes = results.citas.slice(0, 10);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error general dashboard:', err);
                this.isLoading = false;
            }
        });
    }

    getStatusClass(estado: string): string {
        if (!estado) return '';
        const e = estado.toLowerCase();
        if (e.includes('pendiente')) return 'status-pending';
        if (e.includes('completada')) return 'status-completed';
        if (e.includes('cancelada')) return 'status-cancelled';
        return '';
    }
}
