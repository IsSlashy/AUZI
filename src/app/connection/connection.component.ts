import { Component } from '@angular/core';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AUTHENTICATE_USER } from '../GraphQL/connexion'; 

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
    // Configure Apollo Client
    this.apolloClient = new ApolloClient({
      link: new HttpLink({
        uri: 'http://localhost:5000/graphql',
        fetchOptions: {
          mode: 'cors',
        },
      }),
      cache: new InMemoryCache(),
      connectToDevTools: true,
    });
  }

  async connect() {
    console.log('Attempting to authenticate with:', this.email, this.password);

    try {
      const result = await this.apolloClient.mutate({
        mutation: AUTHENTICATE_USER,  // Utilisation de la mutation importée
        variables: {
          input: {  // Envoyez les variables en tant qu'objet input
            email: this.email,
            password: this.password,
          },
        },
      });

      console.log('Received data:', result.data);

      if (result.data && result.data.authenticateUser && result.data.authenticateUser.token) {
        console.log('Authentication successful, navigating to /home');
        localStorage.setItem('access-token', result.data.authenticateUser.token);
        alert('Authentication successful! Redirecting to home page.');
        this.router.navigate(['/home']);
      } else {
        console.error('Authentication failed, no token received.');
        alert('Authentication failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('There was an error during authentication:', error);
      alert('An error occurred during authentication. Please try again later.');
    }
  }
}
