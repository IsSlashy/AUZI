import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ConnectionComponent } from './connection/connection.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './dashboard/profile/profile.component';
import { SubscriptionComponent } from './dashboard/subscription/subscription.component';
import { PreferencesComponent } from './dashboard/preferences/preferences.component';
import { DocumentsComponent } from './dashboard/documents/documents.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'navbar',
    component: NavbarComponent,
  },
  {
    path: 'login',
    component: ConnectionComponent,
    data: { hideNavbar: true },
  },
  {
    path: 'register',
    component: SignupComponent,
    data: { hideNavbar: true },
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    data: { hideNavbar: true },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'subscription',
        component: SubscriptionComponent,
      },
      {
        path: 'preferences',
        component: PreferencesComponent,
      },
      {
        path: 'documents',
        component: DocumentsComponent,
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
    ],
  },
];
