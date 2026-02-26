import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { PacienteService } from '../../services/paciente.service';
import { CitaService } from '../../services/cita.service';
import { PacienteResponse } from '../../models/paciente.models';
import { CitaResponse } from '../../models/cita.models';

@Component({
    selector: 'app-patient-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './patient-dashboard.component.html',
    styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit {
    private authService = inject(AuthService);
    private usuarioService = inject(UsuarioService);
    private pacienteService = inject(PacienteService);
    private citaService = inject(CitaService);
    private router = inject(Router);

    patientName: string = 'Paciente';
    currentPatient: PacienteResponse | null = null;
    misCitas: CitaResponse[] = [];
    isLoading: boolean = true;

    ngOnInit(): void {
        this.cargarDatosPaciente();
    }

    cargarDatosPaciente(): void {
        const username = this.authService.getUsername();
        if (!username) return;

        this.usuarioService.listar().subscribe(usuarios => {
            const user = usuarios.find(u => u.username === username);
            if (user) {
                // Buscamos al paciente que tenga el mismo nombre de usuario o vincular por algún criterio
                // En este sistema, asumiremos que podemos listar pacientes y buscar por un campo común
                // o que el usuario administrador registró al paciente con un DNI que podríamos tener.
                // Por ahora, buscaremos un paciente cuyos nombres coincidan con el username para demostración
                // o simplemente tomaremos el primer paciente si es un entorno de prueba.
                this.pacienteService.listar().subscribe(pacientes => {
                    // Intento de vinculación lógica:
                    const found = pacientes.find(p =>
                        p.nombres.toLowerCase().includes(username.toLowerCase()) ||
                        p.apellidos.toLowerCase().includes(username.toLowerCase())
                    );

                    if (found) {
                        this.currentPatient = found;
                        this.patientName = `${found.nombres} ${found.apellidos}`;
                        this.cargarMisCitas(found.idPaciente);
                    } else {
                        this.isLoading = false;
                    }
                });
            }
        });
    }

    cargarMisCitas(idPaciente: number): void {
        this.citaService.listar().subscribe({
            next: (data) => {
                this.misCitas = data.filter(c => c.idPaciente === idPaciente);
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    nuevaCita(): void {
        this.router.navigate(['/citas']);
    }

    getStatusClass(estado: string): string {
        const e = estado.toLowerCase();
        if (e.includes('pendiente')) return 'status-pending';
        if (e.includes('completada')) return 'status-completed';
        if (e.includes('cancelada')) return 'status-cancelled';
        return '';
    }
}
