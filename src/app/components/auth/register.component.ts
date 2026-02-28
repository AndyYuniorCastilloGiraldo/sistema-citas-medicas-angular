import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.models';
import { PacienteService } from '../../services/paciente.service';
import { PacienteRequest } from '../../models/paciente.models';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    private authService = inject(AuthService);
    private pacienteService = inject(PacienteService);
    private router = inject(Router);

    registerData: RegisterRequest = {
        email: '',
        password: '',
        rolId: 2 // Por defecto rol de usuario
    };

    pacienteData: PacienteRequest = {
        nombres: '',
        apellidos: '',
        dni: '',
        telefono: '',
        correo: '',
        direccion: ''
    };

    successMessage: string = '';
    errorMessage: string = '';
    isLoading: boolean = false;

    onSubmit(): void {

        this.registerData.email = this.registerData.email.trim().toLowerCase();

        this.isLoading = true;
        this.errorMessage = '';

        // 1️⃣ REGISTRAR USUARIO
        this.authService.register(this.registerData).subscribe({
            next: () => {

                // 2️⃣ LOGIN AUTOMÁTICO con email
                this.authService.login({
                    email: this.registerData.email,
                    password: this.registerData.password
                }).subscribe({
                    next: () => {

                        // 3️⃣ YA HAY TOKEN → CREAR PACIENTE
                        this.pacienteData.correo = this.registerData.email;

                        this.pacienteService.crear(this.pacienteData).subscribe({
                            next: () => {
                                this.isLoading = false;
                                this.router.navigate(['/login']);
                            },
                            error: (err) => {
                                this.isLoading = false;
                                this.errorMessage = 'Usuario creado pero error al crear paciente';
                                console.error(err);
                            }
                        });

                    },
                    error: () => {
                        this.isLoading = false;
                        this.errorMessage = 'Error al iniciar sesión automática';
                    }
                });

            },
            error: () => {
                this.isLoading = false;
                this.errorMessage = 'Error al registrar usuario';
            }
        });
    }

}

