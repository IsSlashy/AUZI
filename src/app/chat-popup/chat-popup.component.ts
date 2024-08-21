import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-popup',
  templateUrl: './chat-popup.component.html',
  styleUrls: ['./chat-popup.component.scss'],
  standalone: true
})
export class ChatPopupComponent {
  isOpen = false;

  openPopup() {
    this.isOpen = true;
    const popup = document.getElementById('popup');
    if (popup) {
      popup.classList.add('active');
    }
  }

  closePopup() {
    this.isOpen = false;
    const popup = document.getElementById('popup');
    if (popup) {
      popup.classList.remove('active');
    }
  }
}
