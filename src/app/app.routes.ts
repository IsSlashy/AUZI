import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ConnectionComponent } from './connection/connection.component'; // Assuming this is your profile or login component
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirect to home by default
  { path: 'home', component: HomeComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'login', component: ConnectionComponent },  // Login route
  { path: 'register', component: SignupComponent },  // Registration route
  { path: 'profile', component: ConnectionComponent },  // Add profile route for ConnectionComponent
  { path: 'forgot-password', component: ForgotPasswordComponent },
];
