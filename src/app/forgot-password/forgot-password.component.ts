import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private router: Router) {}

  resetPassword() {
    // Here you will handle the logic to send a reset password email.
    console.log('Reset password request for:', this.email);

    // You can also add an alert or a message that the email has been sent.
    alert('If an account with this email exists, a reset link has been sent.');
    this.router.navigate(['/login']);  // Redirect back to login after the request
  }
}
