import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.models';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    loginData: LoginRequest = {
        username: '',
        password: ''
    };

    errorMessage: string = '';
    isLoading: boolean = false;

    onSubmit(): void {
        if (this.loginData.username && this.loginData.password) {
            this.isLoading = true;
            this.errorMessage = '';

            this.authService.login(this.loginData).subscribe({
                next: () => {
                    this.router.navigate(['/']);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = 'Credenciales inválidas. Por favor intente de nuevo.';
                    console.error('Login error:', err);
                }
            });
        }
    }
}
