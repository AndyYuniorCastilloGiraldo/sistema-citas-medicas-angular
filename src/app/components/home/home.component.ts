import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../layout/navbar.component';
import { SidebarComponent } from '../layout/sidebar.component';
import { AdminDashboardComponent } from '../dashboard/admin-dashboard.component';
import { MedicoDashboardComponent } from '../dashboard/medico-dashboard.component';
import { PatientDashboardComponent } from '../dashboard/patient-dashboard.component';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        NavbarComponent,
        SidebarComponent,
        AdminDashboardComponent,
        MedicoDashboardComponent,
        PatientDashboardComponent
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
    private authService = inject(AuthService);
    role = this.authService.getRole();
}
