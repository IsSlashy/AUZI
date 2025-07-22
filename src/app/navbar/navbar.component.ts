import { Component, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChatPopupComponent } from '../chat-popup/chat-popup.component';

@Component({
    selector: 'app-navbar',
    imports: [ChatPopupComponent, CommonModule],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements AfterViewInit {
  @ViewChild('chatPopup') chatPopup!: ChatPopupComponent;
  isMenuOpen = false;
  isDropdownOpen = false;
  isLoggedIn = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access-token');
      this.isLoggedIn = !!token;
    }
  }

  ngAfterViewInit() {
    // Initialization if needed
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onProfileClick(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
    this.isDropdownOpen = false;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access-token');
      this.isLoggedIn = false;
      this.isDropdownOpen = false;
      this.router.navigate(['/login']);
    }
  }

  openPopup() {
    if (this.chatPopup) {
      this.chatPopup.openPopup();
    } else {
      console.error('ChatPopupComponent is not available');
    }
  }

  // Optionnel : Méthode utilitaire pour vérifier si on est dans le navigateur
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
