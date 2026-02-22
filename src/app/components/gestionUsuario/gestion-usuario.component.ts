import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, timeout } from 'rxjs';
import { UsuarioResponse, UsuarioRequest } from '../../models/usuario.models';
import { UsuarioService } from '../../services/usuario.service';

@Component({
    selector: 'app-gestion-usuario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './gestion-usuario.component.html',
    styleUrl: './gestion-usuario.component.css'
})
export class GestionUsuarioComponent implements OnInit {
    private usuarioService = inject(UsuarioService);
    private router = inject(Router);

    usuarios: UsuarioResponse[] = [];
    filteredUsuarios: UsuarioResponse[] = [];
    searchTerm: string = '';
    selectedRole: string = '';
    isLoading: boolean = false;
    errorMessage: string = '';

    // Modal State
    showModal: boolean = false;
    isSaving: boolean = false;
    nuevoUsuario: UsuarioRequest = {
        username: '',
        password: '',
        rolId: 3 // Default a USUARIO (Paciente)
    };

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    cargarUsuarios(): void {
  this.isLoading = true;
  this.errorMessage = '';

  this.usuarioService.listar().subscribe({
    next: (data) => {
      this.usuarios = data;
      this.applyFilter();
      this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.errorMessage = 'Error al cargar usuarios.';
      this.isLoading = false;
    }
  });
}

    applyFilter(): void {
        const term = this.searchTerm.toLowerCase();
        const roleTerm = this.selectedRole.toLowerCase();

        this.filteredUsuarios = this.usuarios.filter(u => {
            const matchesSearch = u.username.toLowerCase().includes(term) ||
                u.rolNombre.toLowerCase().includes(term);

            const roleName = u.rolNombre.replace('ROLE_', '').toLowerCase();
            const matchesRole = !this.selectedRole || roleName === roleTerm;

            return matchesSearch && matchesRole;
        });
    }

    openModal(): void {
        this.showModal = true;
        this.nuevoUsuario = { username: '', password: '', rolId: 3 };
    }

    closeModal(): void {
        this.showModal = false;
    }

    volverAlDashboard(): void {
        this.router.navigate(['/']);
    }

    registrarUsuario(): void {
        if (!this.nuevoUsuario.username || !this.nuevoUsuario.password) return;

        this.isSaving = true;
        this.usuarioService.registrar(this.nuevoUsuario).subscribe({
            next: () => {
                this.showModal = false; // Asegurar cierre
                this.cargarUsuarios();
                this.isSaving = false;
            },
            error: (err) => {
                console.error('Error registering user:', err);
                this.isSaving = false;
                alert('Error al registrar usuario. Inténtelo de nuevo.');
            }
        });
    }

    toggleEstado(usuario: UsuarioResponse): void {
        const nuevoEstado = !usuario.estado;
        this.usuarioService.cambiarEstado(usuario.idUsuario, nuevoEstado).subscribe({
            next: () => {
                usuario.estado = nuevoEstado;
            },
            error: (err) => {
                console.error('Error updating status:', err);
            }
        });
    }

    deleteUsuario(id: number): void {
        if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
            this.usuarioService.eliminar(id).subscribe({
                next: () => {
                    this.usuarios = this.usuarios.filter(u => u.idUsuario !== id);
                    this.applyFilter();
                },
                error: (err) => {
                    console.error('Error deleting user:', err);
                }
            });
        }
    }
}
