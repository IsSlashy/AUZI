import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: AppComponent }, // Loading screen as the first route
  { path: 'home', component: HomeComponent }, // Home page route
];
