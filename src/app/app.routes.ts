import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ConnectionComponent } from './connection/connection.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'navbar',
    component: NavbarComponent
  },
  {
    path: 'login',
    component: ConnectionComponent,
    data: { hideNavbar: true }
  },
  {
    path: 'register',
    component: SignupComponent,
    data: { hideNavbar: true }
  },
  {
    path: 'profile',
    component: ConnectionComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    data: { hideNavbar: true }
  }
];
