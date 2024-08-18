import { Component } from '@angular/core';
import { ChatPopupComponent } from "../chat-popup/chat-popup.component";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ChatPopupComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
chatPopup: any;

}
