import { Component } from '@angular/core';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { REGISTER_USER } from '../GraphQL/connexion';  // Mutation for registration

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  phoneNumber: string = '';
  address: string = '';
  zipcode: string = '';
  age: number | undefined;
  gender: string = '';

  private apolloClient: ApolloClient<any>;

  constructor(private router: Router) {
    this.apolloClient = new ApolloClient({
      link: new HttpLink({
        uri: 'http://localhost:5000/graphql',
        fetchOptions: {
          mode: 'cors',
        },
      }),
      cache: new InMemoryCache(),
      connectToDevTools: true,
    });
  }

  async signup() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    console.log('Attempting to register with:', this.email);

    try {
      const result = await this.apolloClient.mutate({
        mutation: REGISTER_USER,
        variables: {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
          phoneNumber: this.phoneNumber,
          address: this.address,
          zipcode: this.zipcode,
          age: this.age,
          gender: this.gender,
        },
      });

      console.log('Received data:', result.data);

      if (result.data && result.data.registerUser) {
        alert('Registration successful! Redirecting to login page.');
        this.router.navigate(['/login']);
      } else {
        console.error('Registration failed.');
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('There was an error during registration:', error);
      alert('An error occurred during registration. Please try again later.');
    }
  }
}
