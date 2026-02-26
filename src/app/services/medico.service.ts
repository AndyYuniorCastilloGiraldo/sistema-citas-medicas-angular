import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicoRequest, MedicoResponse } from '../models/medico.models';

@Injectable({
    providedIn: 'root'
})
export class MedicoService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/medicos';

    listar(): Observable<MedicoResponse[]> {
        return this.http.get<MedicoResponse[]>(`${this.apiUrl}/listar`);
    }

    obtenerPorId(id: number): Observable<MedicoResponse> {
        return this.http.get<MedicoResponse>(`${this.apiUrl}/obtener/${id}`);
    }

    crear(request: MedicoRequest): Observable<MedicoResponse> {
        return this.http.post<MedicoResponse>(`${this.apiUrl}/registrar`, request);
    }

    actualizar(id: number, request: MedicoRequest): Observable<MedicoResponse> {
        return this.http.put<MedicoResponse>(`${this.apiUrl}/actualizar/${id}`, request);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
    }
}
