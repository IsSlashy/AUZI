import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Importation du module FormsModule
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-preferences',
  standalone: true, // <-- Spécifie que le composant est autonome
  imports: [CommonModule, FormsModule], // <-- Ajoutez FormsModule ici
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent {
  preferences = {
    language: 'en',
    theme: 'light',
    receiveNotifications: true,
  };

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    // Charger les préférences de l'utilisateur connecté
    this.apollo
      .query({
        query: gql`
          query GetUserPreferences {
            getUserPreferences {
              language
              theme
              receiveNotifications
            }
          }
        `,
      })
      .subscribe(
        (result: any) => {
          this.preferences = result.data.getUserPreferences;
        },
        (error) => {
          console.error('Erreur lors de la récupération des préférences:', error);
        }
      );
  }

  savePreferences() {
    this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateUserPreferences($input: UpdatePreferencesInput!) {
            updateUserPreferences(input: $input) {
              language
              theme
              receiveNotifications
            }
          }
        `,
        variables: {
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
