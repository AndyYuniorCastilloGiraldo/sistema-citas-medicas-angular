import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EspecialidadRequest, EspecialidadResponse } from '../models/especialidad.models';

@Injectable({
    providedIn: 'root'
})
export class EspecialidadService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/especialidad';

    listar(): Observable<EspecialidadResponse[]> {
        return this.http.get<EspecialidadResponse[]>(this.apiUrl);
    }

    obtenerPorId(id: number): Observable<EspecialidadResponse> {
        return this.http.get<EspecialidadResponse>(`${this.apiUrl}/${id}`);
    }

    crear(request: EspecialidadRequest): Observable<EspecialidadResponse> {
        return this.http.post<EspecialidadResponse>(this.apiUrl, request);
    }

    actualizar(id: number, request: EspecialidadRequest): Observable<EspecialidadResponse> {
        return this.http.put<EspecialidadResponse>(`${this.apiUrl}/${id}`, request);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
