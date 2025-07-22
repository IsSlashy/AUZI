import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject } from '@apollo/client/core';
import { REGISTER_USER } from '../GraphQL/connexion';

// ---------- Types ----------
interface RegisterUserVars {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
  address: string;
  zipcode: string;
  age: number;
  gender: string;
}

interface RegisterUserData {
  registerUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface GraphQLErrorLike {
  message: string;
  path?: ReadonlyArray<string | number>;
  extensions?: Record<string, any>;
}

interface ApolloErrorLike extends Error {
  graphQLErrors?: readonly GraphQLErrorLike[];
  networkError?: Error | null;
  extraInfo?: any;
}
// ---------------------------

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule],
})
export class SignupComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  phoneNumber = '';
  address = '';
  zipcode = '';
  age: number | null = null;
  gender = '';

  isLoading = false;
  errorMessage = '';

  private apollo: ApolloClient<NormalizedCacheObject>;

  constructor(private router: Router) {
    this.apollo = new ApolloClient({
      link: new HttpLink({
        uri: 'https://api2.auzi.fr/graphql', // idéalement environment.apiUrl + '/graphql'
        fetchOptions: { mode: 'cors', credentials: 'include' },
      }),
      cache: new InMemoryCache(),
      connectToDevTools: false,
    });
  }

  async signup(): Promise<void> {
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.address.trim() ||
      !this.zipcode.trim() ||
      this.age == null ||
      !this.gender.trim()
    ) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const variables: RegisterUserVars = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password,
      phoneNumber: this.phoneNumber.trim() || undefined,
      address: this.address.trim(),
      zipcode: this.zipcode.trim(),
      age: Number(this.age),
      gender: this.gender.trim(),
    };

    this.isLoading = true;
    try {
      const { data } = await this.apollo.mutate<RegisterUserData, RegisterUserVars>({
        mutation: REGISTER_USER,
        variables,
        fetchPolicy: 'no-cache',
      });

      if (data?.registerUser) {
        alert('Inscription réussie ! Vous pouvez vous connecter.');
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'Échec de l’inscription. Réessayez.';
      }
    } catch (err) {
      const e = err as ApolloErrorLike;
      console.error('Erreur inscription:', {
        message: e.message,
        network: e.networkError,
        gql: e.graphQLErrors,
      });
      this.errorMessage =
        e.graphQLErrors?.[0]?.message ||
        e.networkError?.message ||
        'Erreur lors de l’inscription.';
    } finally {
      this.isLoading = false;
    }
  }
}
