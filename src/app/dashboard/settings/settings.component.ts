import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GET_USER_SETTINGS, UPDATE_USER_SETTINGS } from '../../GraphQL/settings';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Pour lier [formGroup]
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    @Inject(PLATFORM_ID) private platformId: Object // Injection de PLATFORM_ID pour détecter le côté client
  ) {
    // Initialisation du formulaire
    this.settingsForm = this.fb.group({
      privacy_level: ['', Validators.required],
      email_visibility: ['', Validators.required],
      phone_visibility: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUserSettings();
  }

  /**
   * Charge les paramètres utilisateur depuis l'API
   */
  private loadUserSettings(): void {
    // Vérifie si le code est exécuté côté navigateur
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const userId = localStorage.getItem('user-id');
    if (!userId) {
      this.errorMessage = 'Utilisateur non authentifié.';
      return;
    }

    this.isLoading = true;
    this.apollo
      .query({
        query: GET_USER_SETTINGS,
        variables: { userId },
      })
      .subscribe({
        next: (result: any) => {
          if (result?.data?.userSettings) {
            this.settingsForm.patchValue(result.data.userSettings);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('[ERROR loadUserSettings]:', error);
          this.errorMessage = 'Erreur lors du chargement des paramètres.';
          this.isLoading = false;
        },
      });
  }

  /**
   * Sauvegarde les paramètres utilisateur
   */
  saveSettings(): void {
    // Vérifie si le code est exécuté côté navigateur
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.settingsForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    const userId = localStorage.getItem('user-id');
    if (!userId) {
      this.errorMessage = 'Utilisateur non authentifié.';
      return;
    }

    this.isLoading = true;
    const input = { userId, ...this.settingsForm.value };

    this.apollo
      .mutate({
        mutation: UPDATE_USER_SETTINGS,
        variables: { input },
      })
      .subscribe({
        next: (result: any) => {
          this.successMessage = 'Paramètres mis à jour avec succès.';
          this.errorMessage = null;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('[ERROR saveSettings]:', error);
          this.errorMessage = 'Erreur lors de la mise à jour des paramètres.';
          this.isLoading = false;
        },
      });
  }
}
