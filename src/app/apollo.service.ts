import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

@Injectable({
  providedIn: 'root', // Provide this service at the root level
})
export class ApolloService {
  constructor(private apollo: Apollo, private httpLink: HttpLink) {
    this.apollo.create({
      link: httpLink.create({ uri: 'http://localhost:4000/graphql' }), // Assurez-vous que l'URI est correct
      cache: new InMemoryCache(),
    });
  }
}
