import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of, timeout } from 'rxjs';
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
    showDeleteModal: boolean = false;
    isSaving: boolean = false;
    selectedUsuarioId: number | null = null;
    idToDelete: number | null = null;
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

        this.usuarioService.listar().pipe(
            finalize(() => this.isLoading = false)
        ).subscribe({
            next: (data) => {
                this.usuarios = Array.isArray(data) ? data : [];
                this.applyFilter();
            },
            error: (err) => {
                console.error(err);
                this.errorMessage = 'Error al cargar usuarios.';
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
        this.usuarioService.registrar(this.nuevoUsuario).pipe(
            finalize(() => this.isSaving = false)
        ).subscribe({
            next: () => {
                this.showModal = false; // Asegurar cierre
                this.cargarUsuarios();
            },
            error: (err) => {
                console.error('Error registering user:', err);
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
        this.idToDelete = id;
        this.showDeleteModal = true;
    }

    closeDeleteModal(): void {
        this.showDeleteModal = false;
        this.idToDelete = null;
    }

    confirmDelete(): void {
        if (this.idToDelete === null) return;

        this.usuarioService.eliminar(this.idToDelete).subscribe({
            next: () => {
                this.usuarios = this.usuarios.filter(u => u.idUsuario !== this.idToDelete);
                this.applyFilter();
                this.closeDeleteModal();
            },
            error: (err) => {
                console.error('Error deleting user:', err);
                alert('No se pudo eliminar el usuario.');
                this.closeDeleteModal();
            }
        });
    }
}
