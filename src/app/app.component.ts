import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';  // Import NavbarComponent

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],  // Include NavbarComponent in imports
})
export class AppComponent implements OnInit {
  isLoading = true;
  showNavbar = true;

  constructor(private router: Router) {
    // Listen to route changes to determine whether to show the navbar
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showNavbar = !this.router.url.includes('profile'); // Adjust this condition as needed
      }
    });
  }

  ngOnInit(): void {
    this.hideGifAfterDelay();
  }

  hideGifAfterDelay(): void {
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/home']);
    }, 2600);
  }
}
