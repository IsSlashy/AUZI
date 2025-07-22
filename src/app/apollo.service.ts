import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

@Injectable({
  providedIn: 'root',
})
export class ApolloService {
  constructor(private apollo: Apollo, private httpLink: HttpLink) {
    // Création du lien HTTP
    const http = httpLink.create({ uri: 'https://api2.auzi.fr/graphql' });

    // Middleware pour ajouter dynamiquement le token JWT
    const auth = setContext(() => {
      const token = localStorage.getItem('token');
      console.log('Token ajouté à la requête:', token); // Debug
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      };
    });

    // Création du client Apollo
    this.apollo.create({
      link: auth.concat(http),
      cache: new InMemoryCache(),
    });
  }
}
