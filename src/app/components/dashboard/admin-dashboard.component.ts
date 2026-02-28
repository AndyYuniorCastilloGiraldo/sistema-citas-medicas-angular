import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CitaService } from '../../services/cita.service';
import { CitaResponse } from '../../models/cita.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  private citaService = inject(CitaService);

  citasRecientes: CitaResponse[] = [];
  isLoading: boolean = true;

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.isLoading = true;

    this.citaService.listar()
      .pipe(
        catchError(err => {
          console.error('Error al cargar citas:', err);
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe(citas => {
        this.citasRecientes = citas;
        this.isLoading = false;
      });
  }

  getStatusClass(estado: string): string {
    if (!estado) return '';
    const e = estado.toLowerCase();
    if (e.includes('pendiente')) return 'status-pending';
    if (e.includes('atendid') || e.includes('completada')) return 'status-completed';
    if (e.includes('cancelada')) return 'status-cancelled';
    return '';
  }
}