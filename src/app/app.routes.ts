import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { HomeComponent } from './components/home/home.component';
import { GestionUsuarioComponent } from './components/gestionUsuario/gestion-usuario.component';
import { GestionPacienteComponent } from './components/gestionPaciente/gestion-paciente.component';
import { GestionEspecialidadComponent } from './components/gestionEspecialidad/gestion-especialidad.component';
import { GestionMedicoComponent } from './components/gestionMedico/gestion-medico.component';
import { GestionCitaComponent } from './components/gestionCita/gestion-cita.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'usuarios', component: GestionUsuarioComponent, canActivate: [authGuard] },
  { path: 'pacientes', component: GestionPacienteComponent, canActivate: [authGuard] },
  { path: 'especialidades', component: GestionEspecialidadComponent, canActivate: [authGuard] },
  { path: 'medicos', component: GestionMedicoComponent, canActivate: [authGuard] },
  { path: 'citas', component: GestionCitaComponent, canActivate: [authGuard] },
  { path: 'nueva-cita', component: GestionCitaComponent, canActivate: [authGuard] },
  { path: 'mis-citas', component: GestionCitaComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];