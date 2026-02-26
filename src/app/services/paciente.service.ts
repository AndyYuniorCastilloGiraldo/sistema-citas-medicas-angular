import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PacienteRequest, PacienteResponse } from '../models/paciente.models';

@Injectable({
    providedIn: 'root'
})
export class PacienteService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/pacientes';

    listar(): Observable<PacienteResponse[]> {
        return this.http.get<PacienteResponse[]>(`${this.apiUrl}/listar`);
    }

    obtenerPorId(id: number): Observable<PacienteResponse> {
        return this.http.get<PacienteResponse>(`${this.apiUrl}/obtener/${id}`);
    }

    crear(request: PacienteRequest): Observable<PacienteResponse> {
        return this.http.post<PacienteResponse>(`${this.apiUrl}/registrar`, request);
    }

    actualizar(id: number, request: PacienteRequest): Observable<PacienteResponse> {
        return this.http.put<PacienteResponse>(`${this.apiUrl}/actualizar/${id}`, request);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
    }
}
