import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],  // Import RouterModule and CommonModule here
})
export class AppComponent implements OnInit {
  redirected = false; // Add this property to avoid the error

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.hideGifAfterDelay();
  }

  hideGifAfterDelay(): void {
    setTimeout(() => {
      this.redirected = true;
      this.router.navigate(['/home']);
    }, 3000); // 3 seconds delay before hiding the GIF and redirecting to home
  }
}
