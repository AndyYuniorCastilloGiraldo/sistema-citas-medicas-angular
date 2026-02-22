import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-patient-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './patient-dashboard.component.html',
    styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent { }
