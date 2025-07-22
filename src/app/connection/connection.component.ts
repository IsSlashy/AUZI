import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
} from '@apollo/client/core';

import {
  AUTHENTICATE_USER,
  AUTHENTICATE_USER_WITH_GOOGLE,
} from '../GraphQL/connexion';

// (Optionnel) Si tu n'utilises pas vraiment ce service, supprime-le des deps
import { SocialAuthService } from '@abacritt/angularx-social-login';

/* ─────────── TYPES ─────────── */
interface GQLError {
  message: string;
  path?: ReadonlyArray<string | number>;
  extensions?: Record<string, unknown>;
}
interface ApolloErr extends Error {
  graphQLErrors?: readonly GQLError[];
  networkError?: any;
  extraInfo?: unknown;
}

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface AuthPayload {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isNewUser?: boolean;
}

interface AuthResponse {
  authenticateUser: AuthPayload;
}
interface GoogleAuthResponse {
  authenticateUserWithGoogle: AuthPayload;
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

/* ─────────── COMPONENT ─────────── */
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
    private authService: SocialAuthService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.apollo = new ApolloClient({
      link: new HttpLink({
        uri: 'https://api2.auzi.fr/graphql', // remplace par environment.apiUrl si tu veux
        fetchOptions: { mode: 'cors', credentials: 'include' },
      }),
      cache: new InMemoryCache(),
      connectToDevTools: !this.isServer(),
    });
  }

  /* ── Connexion email/password ── */
  async connectWithAuzi(): Promise<void> {
    if (this.isServer()) return;

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.toggleLoading(true);
    try {
      const { data } = await this.apollo.mutate<AuthResponse>({
        mutation: AUTHENTICATE_USER,
        variables: {
          input: { email: this.email.trim(), password: this.password },
        },
        fetchPolicy: 'no-cache',
      });

      const payload = data?.authenticateUser;
      if (payload?.accessToken && payload.user) {
        this.storeAuth(payload.accessToken, payload.refreshToken, payload.user);
        this.clearCredentials();
        await this.router.navigate(['/home']);
      } else {
        this.errorMessage = "Échec : aucun accessToken reçu.";
      }
    } catch (err) {
      this.handleAuthError(err as ApolloErr);
    } finally {
      this.toggleLoading(false);
    }
  }

  /* ── Connexion Google (GSI) ── */
  async onGoogleSignInSuccess(event: GoogleSignInSuccessEvent): Promise<void> {
    if (this.isServer()) return;

    this.toggleLoading(true);
    this.errorMessage = '';

    try {
      const googleToken = event.idToken;

      const { data } = await this.apollo.mutate<GoogleAuthResponse>({
        mutation: AUTHENTICATE_USER_WITH_GOOGLE,
        variables: { input: { googleToken } },
        fetchPolicy: 'no-cache',
      });

      const payload = data?.authenticateUserWithGoogle;
      if (!payload) {
        this.errorMessage = "Réponse invalide de l'API Google.";
        return;
      }

      if (payload.isNewUser) {
        await this.router.navigate(['/register']);
        return;
      }

      if (payload.accessToken && payload.user) {
        this.storeAuth(payload.accessToken, payload.refreshToken, payload.user);
        await this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Échec Google : accessToken ou user manquant.';
      }
    } catch (err) {
      console.error('Erreur Google:', err);
      this.errorMessage = 'Erreur lors de la connexion via Google.';
    } finally {
      this.toggleLoading(false);
    }
  }

  onGoogleSignInError(event: GoogleSignInErrorEvent): void {
    console.error('Erreur Google Sign-In:', event);
    this.errorMessage = 'Erreur lors de la connexion Google.';
  }

  /* ── Utils ── */
  private storeAuth(
    accessToken: string,
    refreshToken: string | null,
    user: AuthUser
  ): void {
    if (this.isServer()) return;
    localStorage.setItem('access-token', accessToken);
    if (refreshToken) localStorage.setItem('refresh-token', refreshToken);
    localStorage.setItem('user-id', user.id);
    localStorage.setItem('user-name', `${user.firstName} ${user.lastName}`);
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

  private toggleLoading(state: boolean): void {
    this.isLoading = state;
  }

  /* Static helpers */
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
