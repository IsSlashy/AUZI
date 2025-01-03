import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Importation du module FormsModule
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import { gql } from 'graphql-tag';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent implements OnInit {
  preferences = {
    language: 'en',
    theme: 'light',
    receiveNotifications: true,
  };

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    // Récupération du userId
    const userId = localStorage.getItem('user-id');
    if (!userId) {
      console.error('Aucun userId trouvé dans localStorage');
      return;
    }

    // Charger les préférences de l'utilisateur connecté
    this.apollo
      .query({
        query: gql`
          query GetUserPreferences($userId: ID!) {
            getUserPreferences(userId: $userId) {
              language
              theme
              receiveNotifications
            }
          }
        `,
        variables: {
          userId,
        },
      })
      .subscribe(
        (result: any) => {
          if (result.data?.getUserPreferences) {
            this.preferences = result.data.getUserPreferences;
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération des préférences:', error);
        }
      );
  }

  savePreferences() {
    // Récupération du userId
    const userId = localStorage.getItem('user-id');
    if (!userId) {
      console.error('Aucun userId trouvé dans localStorage');
      return;
    }

    this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateUserPreferences($userId: ID!, $input: UpdatePreferencesInput!) {
            updateUserPreferences(userId: $userId, input: $input) {
              language
              theme
              receiveNotifications
            }
          }
        `,
        variables: {
          userId,
          input: this.preferences,
        },
      })
      .subscribe(
        () => {
          alert('Préférences mises à jour avec succès.');
        },
        (error) => {
          console.error('Erreur lors de la mise à jour des préférences:', error);
        }
      );
  }
}
