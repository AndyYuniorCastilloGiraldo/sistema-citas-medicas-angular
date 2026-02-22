import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitaRequest, CitaResponse } from '../models/cita.models';

@Injectable({
    providedIn: 'root'
})
export class CitaService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/cita';

    listar(): Observable<CitaResponse[]> {
        return this.http.get<CitaResponse[]>(this.apiUrl);
    }

    obtenerPorId(id: number): Observable<CitaResponse> {
        return this.http.get<CitaResponse>(`${this.apiUrl}/${id}`);
    }

    crear(request: CitaRequest): Observable<CitaResponse> {
        return this.http.post<CitaResponse>(this.apiUrl, request);
    }

    actualizar(id: number, request: CitaRequest): Observable<CitaResponse> {
        return this.http.put<CitaResponse>(`${this.apiUrl}/${id}`, request);
    }

    cancelar(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/cancelar`, {});
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
