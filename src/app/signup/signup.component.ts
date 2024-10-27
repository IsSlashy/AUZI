import { Component } from '@angular/core';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { REGISTER_USER } from '../GraphQL/connexion';

interface GraphQLError {
  message: string;
  path?: ReadonlyArray<string | number>;
  extensions?: Record<string, any>;
}

interface ApolloError extends Error {
  graphQLErrors?: readonly GraphQLError[];
  networkError?: Error | null;
  extraInfo?: any;
}

interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
  address: string;
  zipcode: string;
  age: number;
  gender: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
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
  age: number = 0;
  gender: string = '';

  private apolloClient: ApolloClient<any>;

  constructor(private router: Router) {
    this.apolloClient = new ApolloClient({
      link: new HttpLink({
        uri: 'https://api-server.auzi.fr/graphql',
        fetchOptions: {
          mode: 'cors',
          credentials: 'include',
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

    if (!this.firstName || !this.lastName || !this.email || !this.password ||
        !this.address || !this.zipcode || !this.age || !this.gender) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Attempting to register with:', {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      address: this.address,
      zipcode: this.zipcode,
      age: this.age,
      gender: this.gender
    });

    try {
      const result = await this.apolloClient.mutate({
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
        }
      });

      console.log('Registration response:', result);

      if (result.data?.registerUser) {
        alert('Registration successful! Redirecting to login page.');
        this.router.navigate(['/login']);
      } else {
        console.error('Registration failed - no data returned');
        alert('Registration failed. Please try again.');
      }
    } catch (error: unknown) {
      const apolloError = error as ApolloError;
      console.error('Detailed registration error:', {
        message: apolloError.message,
        networkError: apolloError.networkError?.message,
        graphQLErrors: apolloError.graphQLErrors?.map((err: GraphQLError) => ({
          message: err.message,
          path: err.path,
          extensions: err.extensions
        })),
        stack: apolloError.stack
      });
      alert('Registration failed: ' + apolloError.message);
    }
  }
}
