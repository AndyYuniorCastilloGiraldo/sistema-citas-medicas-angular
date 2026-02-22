import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    username = this.authService.getUsername();

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
