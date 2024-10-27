import { Component } from '@angular/core';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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

  async connect() {
    console.log('Login attempt with:', {
      email: this.email,
      password: this.password
    });

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

      console.log('Authentication response:', result);

      if (result.data?.authenticateUser?.token) {
        localStorage.setItem('access-token', result.data.authenticateUser.token);
        console.log('Authentication successful, token stored');
        this.router.navigate(['/home']);
      } else {
        console.error('Authentication failed - no token received');
        alert('Authentication failed. Please check your credentials.');
      }
    } catch (error: unknown) {
      const apolloError = error as ApolloError;
      console.error('Detailed authentication error:', {
        message: apolloError.message,
        networkError: apolloError.networkError?.message,
        graphQLErrors: apolloError.graphQLErrors?.map((err: GraphQLError) => ({
          message: err.message,
          path: err.path,
          extensions: err.extensions
        })),
        stack: apolloError.stack
      });
      alert('Authentication failed: ' + apolloError.message);
    }
  }
}
