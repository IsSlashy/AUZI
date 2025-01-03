import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { InMemoryCache } from '@apollo/client/core';
import { provideClientHydration } from '@angular/platform-browser';

// ==> Import depuis le SDK Google
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';

// Ton factory Apollo
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
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(),

    // Import du module Apollo
    importProvidersFrom(ApolloModule),

    // ==> Import du SocialLoginModule
    importProvidersFrom(SocialLoginModule),

    // Configuration Apollo
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },

    // ==> Configuration SocialAuthService
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            // Ton ID client Google
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('<TON_CLIENT_ID_GOOGLE>')
          }
        ]
      } as SocialAuthServiceConfig
    },
  ],
};
