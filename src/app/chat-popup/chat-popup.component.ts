import { Component } from '@angular/core';
import { NgIf } from '@angular/common';  // Importer NgIf directement

@Component({
  selector: 'app-chat-popup',
  templateUrl: './chat-popup.component.html',
  styleUrls: ['./chat-popup.component.scss'],
  standalone: true,
  imports: [NgIf]  // Importer NgIf directement
})
export class ChatPopupComponent {
  isOpen = false;

  openPopup() {
    this.isOpen = true;
  }

  closePopup() {
    this.isOpen = false;
  }
}
