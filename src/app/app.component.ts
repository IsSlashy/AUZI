import { Component, OnInit, Renderer2 } from '@angular/core';
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
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  isLoading = true;
  showNavbar = true;

  constructor(private router: Router, private renderer: Renderer2) {
    // Listen to route changes to determine whether to show the navbar and disable scrolling
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Hide the navbar on login and register pages
        this.showNavbar = !(this.router.url.includes('/login') || this.router.url.includes('/register'));

        // Disable scrolling on login and register pages
        if (this.router.url.includes('/login') || this.router.url.includes('/register')) {
        }
      }
    });
  }

  ngOnInit(): void {
    this.hideGifAfterDelay();
  }

  hideGifAfterDelay(): void {
    setTimeout(() => {
      this.isLoading = false;
      // Remove navigation to home after loading finishes, user should stay where they navigated
    }, 2600);
  }
}
