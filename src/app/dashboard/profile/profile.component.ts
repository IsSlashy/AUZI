import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GET_USER_PROFILE, UPDATE_USER_PROFILE } from '../../GraphQL/profile';

// Interfaces
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  address: string;
  zipcode: string;
  age: number;
  gender: string;
}

interface GetUserProfileResponse {
  users: UserProfile[];
}

interface UpdateUserProfileResponse {
  updateUserProfile: UserProfile;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  userProfile: UserProfile | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialisation du formulaire
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern('^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$')]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      zipcode: ['', [Validators.required, Validators.pattern('^[0-9]{4,5}$')]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      gender: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserProfile();
    }
  }

  private async loadUserProfile(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = localStorage.getItem('access-token');
    const userId = localStorage.getItem('user-id');

    if (!token || !userId) {
      this.errorMessage = 'Utilisateur non authentifié';
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.apollo.query<GetUserProfileResponse>({
        query: GET_USER_PROFILE,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }).toPromise();

      const currentUser = result?.data?.users?.find((user: UserProfile) => user.id === userId);
      if (currentUser) {
        this.userProfile = currentUser;
        this.profileForm.patchValue({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          phoneNumber: currentUser.phoneNumber || '',
          address: currentUser.address,
          zipcode: currentUser.zipcode,
          age: currentUser.age.toString(),
          gender: currentUser.gender,
        });
        this.errorMessage = null;
      } else {
        this.errorMessage = 'Utilisateur non trouvé';
      }
    } catch (error: any) {
      this.errorMessage = 'Erreur lors du chargement du profil';
      console.error('[ERROR] Détails de l\'erreur:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid || !this.profileForm.dirty || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = localStorage.getItem('access-token');
    const userId = localStorage.getItem('user-id');

    if (!token || !userId) {
      this.errorMessage = 'Utilisateur non authentifié';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const formValue = {
        id: userId,
        ...this.profileForm.value,
        age: parseInt(this.profileForm.value.age as string, 10),
      };

      console.log('Variables envoyées à la mutation :', formValue);

      const result = await this.apollo.mutate<UpdateUserProfileResponse>({
        mutation: UPDATE_USER_PROFILE,
        variables: {
          input: formValue,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }).toPromise();

      if (result?.data?.updateUserProfile) {
        this.userProfile = result.data.updateUserProfile;
        this.successMessage = 'Profil mis à jour avec succès';
        this.profileForm.markAsPristine();
      }
    } catch (error: any) {
      this.errorMessage = 'Erreur lors de la mise à jour du profil';
      console.error('[ERROR] Erreur de mise à jour :', error);
    } finally {
      this.isLoading = false;
    }
  }


  resetForm(): void {
    if (this.userProfile) {
      this.profileForm.patchValue({
        firstName: this.userProfile.firstName || '',
        lastName: this.userProfile.lastName || '',
        email: this.userProfile.email || '',
        phoneNumber: this.userProfile.phoneNumber || '',
        address: this.userProfile.address || '',
        zipcode: this.userProfile.zipcode || '',
        age: this.userProfile.age?.toString() || '',
        gender: this.userProfile.gender || '',
      });
    } else {
      this.profileForm.reset();
    }
    this.profileForm.markAsPristine();
    this.errorMessage = null;
    this.successMessage = null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control?.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) return 'Ce champ est requis';
      if (control.errors['email']) return 'Email invalide';
      if (control.errors['minlength']) return 'Trop court';
      if (control.errors['pattern']) return 'Format invalide';
      if (control.errors['min']) return 'Âge minimum : 18 ans';
      if (control.errors['max']) return 'Âge maximum : 100 ans';
    }
    return '';
  }
}
