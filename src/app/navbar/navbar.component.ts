import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router for navigation
import { ChatPopupComponent } from "../chat-popup/chat-popup.component";
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ChatPopupComponent, NgIf],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'] // Corrected to styleUrls
})
export class NavbarComponent {
  chatPopup: any;

  constructor(private router: Router) {}

  onProfileClick() {
    console.log('Profile icon clicked'); // This will log when the icon is clicked

    // You can navigate to the profile manually using the router if needed
    this.router.navigate(['/profile']);
  }

  // Method to open the chat popup
  openPopup() {
    this.chatPopup.openPopup(); // Assuming chatPopup has an openPopup method
  }
}
