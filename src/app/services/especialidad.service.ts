import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EspecialidadRequest, EspecialidadResponse } from '../models/especialidad.models';

@Injectable({
    providedIn: 'root'
})
export class EspecialidadService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/especialidades';

    listar(): Observable<EspecialidadResponse[]> {
        return this.http.get<EspecialidadResponse[]>(`${this.apiUrl}/listar`);
    }

    obtenerPorId(id: number): Observable<EspecialidadResponse> {
        return this.http.get<EspecialidadResponse>(`${this.apiUrl}/obtener/${id}`);
    }

    crear(request: EspecialidadRequest): Observable<EspecialidadResponse> {
        return this.http.post<EspecialidadResponse>(`${this.apiUrl}/registrar`, request);
    }

    actualizar(id: number, request: EspecialidadRequest): Observable<EspecialidadResponse> {
        return this.http.put<EspecialidadResponse>(`${this.apiUrl}/actualizar/${id}`, request);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
    }
}
