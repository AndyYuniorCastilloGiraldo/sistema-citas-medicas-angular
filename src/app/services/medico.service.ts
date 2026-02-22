import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicoRequest, MedicoResponse } from '../models/medico.models';

@Injectable({
    providedIn: 'root'
})
export class MedicoService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/medico';

    listar(): Observable<MedicoResponse[]> {
        return this.http.get<MedicoResponse[]>(this.apiUrl);
    }

    obtenerPorId(id: number): Observable<MedicoResponse> {
        return this.http.get<MedicoResponse>(`${this.apiUrl}/${id}`);
    }

    crear(request: MedicoRequest): Observable<MedicoResponse> {
        return this.http.post<MedicoResponse>(this.apiUrl, request);
    }

    actualizar(id: number, request: MedicoRequest): Observable<MedicoResponse> {
        return this.http.put<MedicoResponse>(`${this.apiUrl}/${id}`, request);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
