import { Component, inject, PLATFORM_ID } from '@angular/core';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AUTHENTICATE_USER } from '../GraphQL/connexion';

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

@Component({
  selector: 'app-connection',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  private apolloClient: ApolloClient<any>;
  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {
    this.apolloClient = new ApolloClient({
      link: new HttpLink({
        uri: 'https://api.auzi.fr/graphql',
        fetchOptions: {
          mode: 'cors',
          credentials: 'include',
        },
      }),
      cache: new InMemoryCache(),
      connectToDevTools: true,
    });
  }

  async connect() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('Attempting authentication with:', {
        email: this.email,
        password: 'HIDDEN'
      });

      const result = await this.apolloClient.mutate({
        mutation: AUTHENTICATE_USER,
        variables: {
          input: {
            email: this.email,
            password: this.password
          }
        }
      });

      console.log('Authentication response:', result);

      if (result.data?.authenticateUser?.token) {
        const { token, user } = result.data.authenticateUser;

        if (isPlatformBrowser(this.platformId)) {
          // Store token and user info
          localStorage.setItem('access-token', token);
          localStorage.setItem('user-id', user.id);
          localStorage.setItem('user-name', `${user.firstName} ${user.lastName}`);
        }

        // Clear sensitive data
        this.email = '';
        this.password = '';

        console.log('Authentication successful, navigating to home');
        await this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Échec de l\'authentification - Aucun token reçu';
      }
    } catch (error: unknown) {
      const apolloError = error as ApolloError;

      console.error('Authentication error details:', {
        message: apolloError.message,
        networkError: apolloError.networkError,
        graphQLErrors: apolloError.graphQLErrors?.map(err => ({
          message: err.message,
          path: err.path,
          extensions: err.extensions
        }))
      });

      // Set user-friendly error message
      this.errorMessage = apolloError.graphQLErrors?.[0]?.message ||
                         'Erreur lors de la connexion. Veuillez réessayer.';
    } finally {
      this.isLoading = false;
    }
  }

  // Utility method to get decoded token
  static getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access-token');
  }

  // Utility method to get user ID
  static getStoredUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user-id');
  }

  // Utility method to check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}
