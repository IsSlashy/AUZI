import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  activeSection = 'profile';

  constructor(private router: Router) {
    // Vérifier la route actuelle pour mettre à jour activeSection
    const currentPath = this.router.url.split('/').pop();
    if (currentPath) {
      this.activeSection = currentPath;
    }
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    this.router.navigate(['/dashboard', section]);
  }
}
