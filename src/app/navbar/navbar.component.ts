import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatPopupComponent } from '../chat-popup/chat-popup.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ChatPopupComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements AfterViewInit {
  @ViewChild('chatPopup') chatPopup!: ChatPopupComponent;
  isMenuOpen = false;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    // Initialization if needed
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onProfileClick() {
    console.log('Profile icon clicked');
    this.router.navigate(['/profile']);
  }

  openPopup() {
    if (this.chatPopup) {
      this.chatPopup.openPopup();
    } else {
      console.error('ChatPopupComponent is not available');
    }
  }
}
