import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitaRequest, CitaResponse } from '../models/cita.models';

@Injectable({
    providedIn: 'root'
})
export class CitaService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/citas';

    listar(): Observable<CitaResponse[]> {
        return this.http.get<CitaResponse[]>(`${this.apiUrl}/listar`);
    }

    obtenerPorId(id: number): Observable<CitaResponse> {
        return this.http.get<CitaResponse>(`${this.apiUrl}/obtener/${id}`);
    }

    crear(request: CitaRequest): Observable<CitaResponse> {
        return this.http.post<CitaResponse>(`${this.apiUrl}/registrar`, request);
    }

    actualizar(id: number, request: CitaRequest): Observable<CitaResponse> {
        return this.http.put<CitaResponse>(`${this.apiUrl}/actualizar/${id}`, request);
    }

    cancelar(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/cancelar/${id}`, {});
    }

    atender(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/atender/${id}`, {});
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
    }
}
