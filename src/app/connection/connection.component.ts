import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { AUTHENTICATE_USER } from '../GraphQL/connexion';
import { catchError, tap } from 'rxjs/operators';
import { firstValueFrom, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

type AuthResponse = {
  authenticateUser: {
    accessToken: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
};

@Component({
  selector: 'app-connection',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent {
  email!: string;
  password!: string;

  constructor(private apollo: Apollo, private router: Router) {}

  async connect() {
    console.log('Attempting to authenticate with:', this.email, this.password);
    try {
      const result = await firstValueFrom(
        this.apollo.mutate<AuthResponse>({
          mutation: AUTHENTICATE_USER,
          variables: {
            email: this.email,
            password: this.password,
          },
        }).pipe(
          tap(({ data }) => {
            console.log('Received data:', data);
            if (data && data.authenticateUser && data.authenticateUser.accessToken) {
              console.log('Authentication successful, navigating to /admin');
              localStorage.setItem('access-token', data.authenticateUser.accessToken);
              this.router.navigate(['/admin']);
              document.body.classList.add('logged-in');
            } else {
              console.error('Authentication failed, no token received.');
            }
          }),
          catchError((error) => {
            console.error('There was an error during authentication:', error);
            return of(error);
          })
        )
      );
      console.log('Authentication result:', result);
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  }
}
