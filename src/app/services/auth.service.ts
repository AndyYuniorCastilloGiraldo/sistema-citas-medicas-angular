import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);

    private apiUrl = 'http://localhost:8080/api/auth';

    private isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
            tap(response => {
                if (this.isBrowser()) {
                    const normalizedRole = response.rol.replace('ROLE_', '');
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('email', response.username);
                    localStorage.setItem('role', normalizedRole);
                }
            })
        );
    }

    register(request: RegisterRequest): Observable<string> {
        return this.http.post(`${this.apiUrl}/register`, request, { responseType: 'text' });
    }

    logout(): void {
        if (this.isBrowser()) {
            localStorage.clear();
        }
    }

    getToken(): string | null {
        if (this.isBrowser()) {
            return localStorage.getItem('token');
        }
        return null;
    }

    getRole(): string | null {
        if (this.isBrowser()) {
            return localStorage.getItem('role');
        }
        return null;
    }

    getUsername(): string | null {
        if (this.isBrowser()) {
            return localStorage.getItem('email');
        }
        return null;
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}