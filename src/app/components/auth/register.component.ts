import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.models';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    registerData: RegisterRequest = {
        username: '',
        password: '',
        rolId: 2 // Por defecto rol de usuario
    };

    successMessage: string = '';
    errorMessage: string = '';
    isLoading: boolean = false;

    onSubmit(): void {
        if (this.registerData.username && this.registerData.password) {
            this.isLoading = true;
            this.errorMessage = '';
            this.successMessage = '';

            this.authService.register(this.registerData).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.successMessage = 'Usuario registrado correctamente. Redirigiendo al login...';
                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 2000);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = 'Error al registrar el usuario. Por favor intente de nuevo.';
                    console.error('Register error:', err);
                }
            });
        }
    }
}
