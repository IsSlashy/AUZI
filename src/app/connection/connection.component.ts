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
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
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

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('Tentative d\'authentification avec:', { email: this.email, password: 'HIDDEN' });

      const result = await this.apolloClient.mutate({
        mutation: AUTHENTICATE_USER,
        variables: {
          input: {
            email: this.email,
            password: this.password,
          },
        },
      });

      console.log('Réponse d\'authentification:', result);

      const { token, user } = result.data?.authenticateUser || {};
      if (token) {
        this.storeAuthenticationData(token, user);
        this.clearCredentials();

        console.log('Authentification réussie, redirection vers /home');
        await this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Échec de l\'authentification - Aucun token reçu';
      }
    } catch (error: unknown) {
      this.handleAuthenticationError(error as ApolloError);
    } finally {
      this.isLoading = false;
    }
  }

  private storeAuthenticationData(token: string, user: any) {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Stockage des informations d\'authentification');
      localStorage.setItem('access-token', token);
      localStorage.setItem('user-id', user.id);
      localStorage.setItem('user-name', `${user.firstName} ${user.lastName}`);

      // Vérification immédiate
      console.log('Vérification de localStorage:', {
        token: localStorage.getItem('access-token'),
        userId: localStorage.getItem('user-id'),
        userName: localStorage.getItem('user-name'),
      });
    }
  }


  private clearCredentials() {
    this.email = '';
    this.password = '';
  }

  private handleAuthenticationError(error: ApolloError) {
    console.error('Détails de l\'erreur d\'authentification:', {
      message: error.message,
      networkError: error.networkError,
      graphQLErrors: error.graphQLErrors?.map(err => ({
        message: err.message,
        path: err.path,
        extensions: err.extensions,
      })),
    });

    this.errorMessage =
      error.graphQLErrors?.[0]?.message ||
      'Erreur lors de la connexion. Veuillez réessayer.';
  }

  // Static utility methods for token management
  static getStoredToken(): string | null {
    return isPlatformBrowser(PLATFORM_ID) ? localStorage.getItem('access-token') : null;
  }

  static getStoredUserId(): string | null {
    return isPlatformBrowser(PLATFORM_ID) ? localStorage.getItem('user-id') : null;
  }

  static isAuthenticated(): boolean {
    return !!ConnectionComponent.getStoredToken();
  }
}
