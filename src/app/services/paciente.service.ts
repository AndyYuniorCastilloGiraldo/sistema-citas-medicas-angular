import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PacienteRequest, PacienteResponse } from '../models/paciente.models';

@Injectable({
    providedIn: 'root'
})
export class PacienteService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/paciente';

    listar(): Observable<PacienteResponse[]> {
        return this.http.get<PacienteResponse[]>(this.apiUrl);
    }

    obtenerPorId(id: number): Observable<PacienteResponse> {
        return this.http.get<PacienteResponse>(`${this.apiUrl}/${id}`);
    }

    crear(request: PacienteRequest): Observable<PacienteResponse> {
        return this.http.post<PacienteResponse>(this.apiUrl, request);
    }

    actualizar(id: number, request: PacienteRequest): Observable<PacienteResponse> {
        return this.http.put<PacienteResponse>(`${this.apiUrl}/${id}`, request);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
