import {
  Component,
  inject,
  PLATFORM_ID,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Apollo
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

/**
 * Déclare tes propres interfaces pour typer le callback Google
 * selon tes besoins (idToken, credential, etc.).
 */
interface GoogleSignInSuccessEvent {
  idToken: string;
  credential?: string;
  select_by?: string;
}

interface GoogleSignInErrorEvent {
  error: string;
  reason?: string;
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
   * Connexion via email/password
   */
  async connectWithAuzi() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Vérification basique
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log("Tentative d'authentification Auzi avec:", {
        email: this.email,
        password: 'HIDDEN',
      });

      const result = await this.apolloClient.mutate({
        mutation: AUTHENTICATE_USER,
        variables: {
          input: {
            email: this.email,
            password: this.password,
          },
        },
      });

      console.log("Réponse d'authentification:", result);

      const { token, user } = result.data?.authenticateUser || {};
      if (token && user) {
        // Stockage local
        this.storeAuthenticationData(token, user);
        this.clearCredentials();

        console.log("Authentification réussie, redirection vers /home");
        await this.router.navigate(['/home']);
      } else {
        this.errorMessage = "Échec de l'authentification - Aucun token reçu.";
      }
    } catch (error) {
      this.handleAuthenticationError(error as ApolloError);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Connexion via Google (nouvelle API)
   * Ici, on ne fait PLUS de this.authService.signIn()
   * -> C'est le <asl-google-signin-button> qui gère la connexion
   */
  async onGoogleSignInSuccess(event: GoogleSignInSuccessEvent) {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';

      // L'event contient (en général) un idToken Google
      const googleToken = event.idToken;
      console.log('Google ID Token:', googleToken);

      // Mutation GraphQL => authentifier le token côté back
      const result = await this.apolloClient.mutate({
        mutation: GOOGLE_AUTH,
        variables: { googleToken },
      });

      console.log('Réponse Google Auth:', result);

      const { token, user } = result.data?.authenticateUserWithGoogle || {};
      if (token && user) {
        this.storeAuthenticationData(token, user);
        console.log("Authentification Google réussie, redirection vers /home");
        await this.router.navigate(['/home']);
      } else {
        this.errorMessage = "Échec de l'authentification Google - Aucun token reçu.";
      }
    } catch (error) {
      console.error('Erreur lors de la connexion Google :', error);
      this.errorMessage = 'Erreur lors de la connexion via Google.';
    } finally {
      this.isLoading = false;
    }
  }

  onGoogleSignInError(event: GoogleSignInErrorEvent) {
    // Callback appelé en cas d'échec GSI
    console.error('Erreur Google Sign-In:', event);
    this.errorMessage = 'Erreur lors de la connexion Google.';
  }

  /**
   * Stockage local du token et ID user
   */
  private storeAuthenticationData(token: string, user: any) {
    if (isPlatformBrowser(this.platformId)) {
      console.log("Stockage des informations d'authentification");
      localStorage.setItem('access-token', token);
      localStorage.setItem('user-id', user.id);  // <-- ID dynamique
      localStorage.setItem('user-name', `${user.firstName} ${user.lastName}`);

      // Vérification
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
    console.error("Détails de l'erreur d'authentification:", {
      message: error.message,
      networkError: error.networkError,
      graphQLErrors: error.graphQLErrors?.map((err) => ({
        message: err.message,
        path: err.path,
        extensions: err.extensions,
      })),
    });

    this.errorMessage =
      error.graphQLErrors?.[0]?.message ||
      'Erreur lors de la connexion. Veuillez réessayer.';
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
