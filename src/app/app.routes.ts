import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { HomeComponent } from './components/home/home.component';
import { GestionUsuarioComponent } from './components/gestionUsuario/gestion-usuario.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '', component: HomeComponent, canActivate: [authGuard] },
    { path: 'usuarios', component: GestionUsuarioComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
