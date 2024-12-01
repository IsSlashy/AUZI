import { Component, OnInit, Renderer2, PLATFORM_ID, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
})
export class AppComponent implements OnInit {
  isLoading = true;
  showNavbar = false;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!this.isLoading) {
          const protectedRoutes = ['/login', '/register', '/forgot-password', '/profile'];
          this.showNavbar = !protectedRoutes.some(route => this.router.url === route);

          if (isPlatformBrowser(this.platformId)) {
            if (!this.showNavbar) {
              this.renderer.addClass(document.body, 'auth-page');
            } else {
              this.renderer.removeClass(document.body, 'auth-page');
            }
          }
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
      setTimeout(() => {
        const protectedRoutes = ['/login', '/register', '/forgot-password', '/profile'];
        this.showNavbar = !protectedRoutes.some(route => this.router.url === route);
      }, 100);
    }, 2600);
  }
}
