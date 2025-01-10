import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

// Apollo
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

// Social Login
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';

/**
 * Factory de création pour Apollo, associée à APOLLO_OPTIONS.
 */
function createApollo(httpLink: HttpLink) {
  return {
    cache: new InMemoryCache(),
    link: httpLink.create({
      uri: 'https://api.auzi.fr/graphql',
      withCredentials: true,
    }),
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Router & routes
    provideRouter(routes),

    // HttpClient avec fetch()
    provideHttpClient(withFetch()),

    // Client-side hydration (SSR + CSR)
    provideClientHydration(),

    // Import des modules (Apollo + SocialLogin)
    importProvidersFrom(ApolloModule),
    importProvidersFrom(SocialLoginModule),

    // Configuration d’Apollo
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },

    // Configuration SocialAuthService
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            // Remplace <TON_CLIENT_ID_GOOGLE> par ta vraie clé
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('233704624415-0vdih4fl0c4g93cu5pcgjllhdadtk954.apps.googleusercontent.com'),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
};
