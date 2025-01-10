import {
  Component,
  inject,
  PLATFORM_ID,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { AUTHENTICATE_USER, GOOGLE_AUTH } from '../GraphQL/connexion';

// Social Auth
import { SocialAuthService } from '@abacritt/angularx-social-login';

/** Types d'erreur GraphQL */
interface GraphQLError {
  message: string;
  path?: ReadonlyArray<string | number>;
  extensions?: Record<string, any>;
}

/** Type d'erreur Apollo */
interface ApolloError extends Error {
  graphQLErrors?: readonly GraphQLError[];
  networkError?: Error | null;
  extraInfo?: any;
}

/** Interfaces pour le callback Google */
interface GoogleSignInSuccessEvent {
  idToken: string;
  credential?: string;
  select_by?: string;
}

interface GoogleSignInErrorEvent {
  error: string;
  reason?: string;
}

/** Exemple : Payload possible renvoyé par authenticateUserWithGoogle */
interface GoogleAuthPayload {
  token: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    // ...
  } | null;
  isNewUser?: boolean;  // <-- indicateur si l'utilisateur est neuf
}

@Component({
  standalone: true,
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ConnectionComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  private apolloClient: ApolloClient<any>;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private router: Router,
    private authService: SocialAuthService
  ) {
    // Configuration Apollo
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

  /**
   * Connexion classique (email/password)
   */
  async connectWithAuzi() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.apolloClient.mutate({
        mutation: AUTHENTICATE_USER,
        variables: {
          input: {
            email: this.email,
            password: this.password,
          },
        },
      });

      const { token, user } = result.data?.authenticateUser || {};
      if (token && user) {
        this.storeAuthenticationData(token, user);
        this.clearCredentials();
        await this.router.navigate(['/home']);
      } else {
        this.errorMessage = "Échec : Aucun token reçu.";
      }
    } catch (error) {
      this.handleAuthenticationError(error as ApolloError);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Connexion via Google
   * -> Gérée par le <asl-google-signin-button> (voir le template HTML).
   */
  async onGoogleSignInSuccess(event: GoogleSignInSuccessEvent) {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';

      const googleToken = event.idToken;
      console.log('Google ID Token:', googleToken);

      // Appel la mutation Google Auth
      // (on suppose que le resolver renvoie "isNewUser" si l'utilisateur n'existe pas)
      const { data } = await this.apolloClient.mutate({
        mutation: GOOGLE_AUTH,
        variables: { googleToken },
      });

      // Exemple de structure attendue
      const payload = data?.authenticateUserWithGoogle as GoogleAuthPayload;

      if (!payload) {
        this.errorMessage = "Réponse invalide de l'API Google Auth.";
        return;
      }

      const { token, user, isNewUser } = payload;

      // 1) S'il est neuf -> rediriger vers /register
      if (isNewUser) {
        console.log('Utilisateur Google non existant : redirection vers /register');
        await this.router.navigate(['/register']);
        return;
      }

      // 2) Sinon, s'il y a un token + user => redirection vers /home
      if (token && user) {
        this.storeAuthenticationData(token, user);
        console.log('Authentification Google réussie, redirection vers /home');
        await this.router.navigate(['/home']);
      } else {
        this.errorMessage = "Échec Google - Aucun token ou user renvoyé.";
      }
    } catch (error) {
      console.error('Erreur lors de la connexion Google :', error);
      this.errorMessage = 'Erreur lors de la connexion via Google.';
    } finally {
      this.isLoading = false;
    }
  }

  onGoogleSignInError(event: GoogleSignInErrorEvent) {
    console.error('Erreur Google Sign-In:', event);
    this.errorMessage = 'Erreur lors de la connexion Google.';
  }

  /**
   * Stocker le token + user en localStorage
   */
  private storeAuthenticationData(token: string, user: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access-token', token);
      localStorage.setItem('user-id', user.id);
      localStorage.setItem('user-name', `${user.firstName} ${user.lastName}`);
    }
  }

  private clearCredentials() {
    this.email = '';
    this.password = '';
  }

  private handleAuthenticationError(error: ApolloError) {
    console.error("Détails de l'erreur d'authentification:", {
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
      'Erreur lors de la connexion. Réessayez.';
  }

  // ---- Méthodes statiques utiles (optionnel) ----
  static getStoredToken(): string | null {
    return isPlatformBrowser(PLATFORM_ID)
      ? localStorage.getItem('access-token')
      : null;
  }

  static getStoredUserId(): string | null {
    return isPlatformBrowser(PLATFORM_ID)
      ? localStorage.getItem('user-id')
      : null;
  }

  static isAuthenticated(): boolean {
    return !!ConnectionComponent.getStoredToken();
  }
}
