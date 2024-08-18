import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';  // Import NavbarComponent

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],  // Include NavbarComponent in imports
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  isLoading = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.hideGifAfterDelay();
  }

  hideGifAfterDelay(): void {
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/home']);
    }, 2600);
  }
}
