import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject } from '@apollo/client/core';
import { AUTHENTICATE_USER, AUTHENTICATE_USER_WITH_GOOGLE } from '../GraphQL/connexion';

// Social Auth (si tu l'utilises vraiment)
import { SocialAuthService } from '@abacritt/angularx-social-login';

/* ============================== */
/*            TYPES               */
/* ============================== */
interface GraphQLError {
  message: string;
  path?: ReadonlyArray<string | number>;
  extensions?: Record<string, unknown>;
}

interface ApolloErr extends Error {
  graphQLErrors?: readonly GraphQLError[];
  networkError?: Error | null;
  extraInfo?: unknown;
}

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface AuthPayload {
  token: string | null;
  user: AuthUser | null;
}

interface AuthResponse {
  authenticateUser: AuthPayload;
}

// --- Google ---
interface GoogleAuthPayload extends AuthPayload {
  isNewUser?: boolean;
}
interface GoogleAuthResponse {
  authenticateUserWithGoogle: GoogleAuthPayload;
}

interface GoogleSignInSuccessEvent {
  idToken: string;
  credential?: string;
  select_by?: string;
}
interface GoogleSignInErrorEvent {
  error: string;
  reason?: string;
}

/* ============================== */

@Component({
  selector: 'app-connection',
  standalone: true,
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ConnectionComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  private apollo: ApolloClient<NormalizedCacheObject>;

  constructor(
    private router: Router,
    private authService: SocialAuthService, // si non utilisé, retire-le
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.apollo = new ApolloClient({
      link: new HttpLink({
        uri: 'https://api2.auzi.fr/graphql', // ou environment.apiUrl
        fetchOptions: {
          mode: 'cors',
          credentials: 'include',
        },
      }),
      cache: new InMemoryCache(),
      connectToDevTools: !this.isServer(),
    });
  }

  /* ============================== */
  /*   Connexion email / password   */
  /* ============================== */
  async connectWithAuzi(): Promise<void> {
    if (this.isServer()) return;

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const { data } = await this.apollo.mutate<AuthResponse>({
        mutation: AUTHENTICATE_USER,
        variables: {
          input: {
            email: this.email,
            password: this.password,
          },
        },
        fetchPolicy: 'no-cache',
      });

      const payload = data?.authenticateUser;
      if (payload?.token && payload.user) {
        this.storeAuth(payload.token, payload.user);
        this.clearCredentials();
        await this.router.navigate(['/home']);
      } else {
        this.errorMessage = "Échec : aucun token reçu.";
      }
    } catch (err) {
      this.handleAuthError(err as ApolloErr);
    } finally {
      this.isLoading = false;
    }
  }

  /* ============================== */
  /*        Connexion Google        */
  /*  (appelée par le bouton GSI)   */
  /* ============================== */
  async onGoogleSignInSuccess(event: GoogleSignInSuccessEvent): Promise<void> {
    if (this.isServer()) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';

      const googleToken = event.idToken;
      const { data } = await this.apollo.mutate<GoogleAuthResponse>({
        mutation: AUTHENTICATE_USER_WITH_GOOGLE,
        variables: { googleToken },
        fetchPolicy: 'no-cache',
      });

      const payload = data?.authenticateUserWithGoogle;
      if (!payload) {
        this.errorMessage = "Réponse invalide de l'API Google.";
        return;
      }

      const { token, user, isNewUser } = payload;

      if (isNewUser) {
        await this.router.navigate(['/register']);
        return;
      }

      if (token && user) {
        this.storeAuth(token, user);
        await this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Échec Google : token ou utilisateur manquant.';
      }
    } catch (err) {
      console.error('Erreur Google:', err);
      this.errorMessage = 'Erreur lors de la connexion via Google.';
    } finally {
      this.isLoading = false;
    }
  }

  onGoogleSignInError(event: GoogleSignInErrorEvent): void {
    console.error('Erreur Google Sign-In:', event);
    this.errorMessage = 'Erreur lors de la connexion Google.';
  }

  /* ============================== */
  /*          Utils localStorage    */
  /* ============================== */
  private storeAuth(token: string, user: AuthUser): void {
    if (!this.isServer()) {
      localStorage.setItem('access-token', token);
      localStorage.setItem('user-id', user.id);
      localStorage.setItem('user-name', `${user.firstName} ${user.lastName}`);
    }
  }

  private clearCredentials(): void {
    this.email = '';
    this.password = '';
  }

  private handleAuthError(error: ApolloErr): void {
    console.error('Auth error details:', {
      message: error.message,
      networkError: error.networkError,
      graphQLErrors: error.graphQLErrors?.map(e => ({
        message: e.message,
        path: e.path,
        extensions: e.extensions,
      })),
    });

    this.errorMessage =
      error.graphQLErrors?.[0]?.message ??
      'Erreur lors de la connexion. Réessayez.';
  }

  private isServer(): boolean {
    return !isPlatformBrowser(this.platformId);
  }

  /* Méthodes statiques : évite d’utiliser PLATFORM_ID statiquement */
  static getStoredToken(): string | null {
    try {
      return typeof window !== 'undefined'
        ? localStorage.getItem('access-token')
        : null;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!ConnectionComponent.getStoredToken();
  }
}
