// src/signup/signup.component.ts
import { Component } from '@angular/core';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { REGISTER_USER } from '../GraphQL/connexion';

interface RegisterPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
interface RegisterResponse {
  registerUser: RegisterPayload;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  phoneNumber = '';
  address = '';
  zipcode = '';
  age = 0;
  gender = '';

  private apollo: ApolloClient<any>;

  constructor(private router: Router) {
    this.apollo = new ApolloClient({
      link: new HttpLink({
        uri: 'https://api2.auzi.fr/graphql',
        fetchOptions: { mode: 'cors', credentials: 'include' },
      }),
      cache: new InMemoryCache(),
    });
  }

  async signup() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!this.firstName || !this.lastName || !this.email || !this.password ||
        !this.address || !this.zipcode || !this.age || !this.gender) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data } = await this.apollo.mutate<RegisterResponse>({
        mutation: REGISTER_USER,
        variables: {
          firstName: this.firstName.trim(),
          lastName: this.lastName.trim(),
          email: this.email.trim(),
          password: this.password,
          phoneNumber: this.phoneNumber.trim() || undefined,
          address: this.address.trim(),
          zipcode: this.zipcode.trim(),
          age: Number(this.age),
          gender: this.gender.trim()
        },
        fetchPolicy: 'no-cache',
      });

      if (data?.registerUser) {
        alert('Registration successful! Redirecting to login page.');
        this.router.navigate(['/login']);
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (e: any) {
      console.error('Registration error:', e);
      alert('Registration failed: ' + e.message);
    }
  }
}
