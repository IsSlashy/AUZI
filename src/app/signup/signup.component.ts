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
    // Validation des champs
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!this.firstName || !this.lastName || !this.email || !this.password ||
        !this.address || !this.zipcode || this.age === 0 || !this.gender) {
      alert('Please fill in all required fields');
      return;
    }

    // Préparation des données
    const signupInput: RegisterUserInput = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password,
      phoneNumber: this.phoneNumber.trim() || null,
      address: this.address.trim(),
      zipcode: this.zipcode.trim(),
      age: Number(this.age),
      gender: this.gender.trim()
    };

    console.log('Attempting to register with input:', signupInput);

    try {
      // Envoi de la mutation
      const result = await this.apolloClient.mutate({
        mutation: REGISTER_USER,
        variables: {
          input: signupInput
        }
      });

      console.log('Registration response:', result);

      // Gestion du succès
      if (result.data?.registerUser) {
        alert('Registration successful! Redirecting to login page.');
        this.router.navigate(['/login']);
      } else {
        throw new Error('No data returned from registration');
      }

    } catch (error: unknown) {
      // Gestion des erreurs
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

      // Message d'erreur plus descriptif
      const errorMessage = apolloError.graphQLErrors?.[0]?.message || apolloError.message;
      alert(`Registration failed: ${errorMessage}`);
    }
  }
}
