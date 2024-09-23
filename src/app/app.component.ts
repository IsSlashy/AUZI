import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent], 
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  isLoading = true;
  showNavbar = true;

  constructor(private router: Router, private renderer: Renderer2) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showNavbar = !(this.router.url.includes('/login') || this.router.url.includes('/register'));
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
    }, 2600);
  }
}
