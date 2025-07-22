import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GET_USER_SETTINGS, UPDATE_USER_SETTINGS } from '../../GraphQL/settings';

@Component({
    selector: 'app-settings',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // Formulaire local
  settingsForm: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Noms de champs alignés sur le schéma API (camelCase)
    this.settingsForm = this.fb.group({
      privacyLevel: ['', Validators.required],
      emailVisibility: ['', Validators.required],
      phoneVisibility: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.isBrowser()) {
      this.loadUserSettings();
    } else {
      console.warn('Cette fonctionnalité est disponible uniquement côté client.');
    }
  }

  /**
   * Vérifie si le code est exécuté côté navigateur
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Charge les paramètres utilisateur depuis l'API
   */
  private loadUserSettings(): void {
    if (!this.isBrowser()) return;

    const userId = this.getUserIdFromLocalStorage();
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
          // Ici, on récupère "getUserSettings" et non "userSettings"
          const userSettings = result?.data?.getUserSettings;
          if (userSettings) {
            this.settingsForm.patchValue({
              privacyLevel: userSettings.privacyLevel,
              emailVisibility: userSettings.emailVisibility,
              phoneVisibility: userSettings.phoneVisibility,
            });
            this.errorMessage = null;
          } else {
            this.errorMessage = 'Impossible de récupérer les paramètres utilisateur.';
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
    if (!this.isBrowser()) return;

    if (this.settingsForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    const userId = this.getUserIdFromLocalStorage();
    if (!userId) {
      this.errorMessage = 'Utilisateur non authentifié.';
      return;
    }

    this.isLoading = true;

    // On envoie le userId et l'objet input pour la mutation
    const input = {
      privacyLevel: this.settingsForm.value.privacyLevel,
      emailVisibility: this.settingsForm.value.emailVisibility,
      phoneVisibility: this.settingsForm.value.phoneVisibility,
    };

    this.apollo
      .mutate({
        mutation: UPDATE_USER_SETTINGS,
        variables: {
          userId,
          input,
        },
      })
      .subscribe({
        next: () => {
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

  /**
   * Récupère l'identifiant utilisateur depuis le localStorage
   */
  private getUserIdFromLocalStorage(): string | null {
    if (!this.isBrowser()) return null;
    try {
      return localStorage.getItem('user-id');
    } catch (error) {
      console.error('[ERROR getUserIdFromLocalStorage]:', error);
      return null;
    }
  }
}
