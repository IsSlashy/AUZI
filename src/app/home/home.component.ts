import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule],  // Import CommonModule here
})
export class HomeComponent implements OnInit {
  title = 'Welcome to the Home Page!';  // Define the title property
  isVisible = false;

  ngOnInit(): void {
    this.isVisible = true;  // Ensure the home content fades in after loading
  }
}
