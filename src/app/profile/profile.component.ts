import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { CommonModule } from '@angular/common';

// Interfaces
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address: string;
  zipcode: string;
  age: number;
  gender: string;
}

interface GetUserProfileResponse {
  user: UserProfile;
}

interface UpdateUserProfileResponse {
  updateUserProfile: UserProfile;
}

// GraphQL Queries et Mutations
const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      firstName
      lastName
      email
      phoneNumber
      address
      zipcode
      age
      gender
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $id: ID!
    $firstName: String!
    $lastName: String!
    $email: String!
    $phoneNumber: String
    $address: String!
    $zipcode: String!
    $age: Int!
    $gender: String!
  ) {
    updateUserProfile(
      id: $id
      firstName: $firstName
      lastName: $lastName
      email: $email
      phoneNumber: $phoneNumber
      address: $address
      zipcode: $zipcode
      age: $age
      gender: $gender
    ) {
      id
      firstName
      lastName
      email
      phoneNumber
      address
      zipcode
      age
      gender
    }
  }
`;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern('^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$')]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      zipcode: ['', [Validators.required, Validators.pattern('^[0-9]{4,5}$')]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      gender: ['', Validators.required]
    });
  }

  isLoading = false;
  userProfile: UserProfile | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;



  ngOnInit(): void {
    this.loadUserProfile();
  }

  private async loadUserProfile(): Promise<void> {
    const userId = localStorage.getItem('user-id');

    if (!userId) {
      this.errorMessage = 'Utilisateur non authentifié';
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.apollo.query<GetUserProfileResponse>({
        query: GET_USER_PROFILE,
        variables: { id: userId }
      }).toPromise();

      if (result?.data?.user) {
        this.userProfile = result.data.user;
        this.profileForm.patchValue({
          firstName: this.userProfile.firstName,
          lastName: this.userProfile.lastName,
          email: this.userProfile.email,
          phoneNumber: this.userProfile.phoneNumber || '',
          address: this.userProfile.address,
          zipcode: this.userProfile.zipcode,
          age: this.userProfile.age.toString(),
          gender: this.userProfile.gender
        });
      }
    } catch (error) {
      this.errorMessage = 'Erreur lors du chargement du profil';
      console.error('Error loading profile:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid || !this.profileForm.dirty) {
      return;
    }

    const userId = localStorage.getItem('user-id');

    if (!userId) {
      this.errorMessage = 'Utilisateur non authentifié';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const formValue = {
        ...this.profileForm.value,
        age: parseInt(this.profileForm.value.age as string, 10)
      };

      const result = await this.apollo.mutate<UpdateUserProfileResponse>({
        mutation: UPDATE_USER_PROFILE,
        variables: {
          id: userId,
          ...formValue
        }
      }).toPromise();

      if (result?.data?.updateUserProfile) {
        this.userProfile = result.data.updateUserProfile;
        this.successMessage = 'Profil mis à jour avec succès';
        this.profileForm.markAsPristine();
      }
    } catch (error) {
      this.errorMessage = 'Erreur lors de la mise à jour du profil';
      console.error('Error updating profile:', error);
    } finally {
      this.isLoading = false;
    }
  }

  resetForm(): void {
    if (this.userProfile) {
      this.profileForm.patchValue({
        firstName: this.userProfile.firstName,
        lastName: this.userProfile.lastName,
        email: this.userProfile.email,
        phoneNumber: this.userProfile.phoneNumber || '',
        address: this.userProfile.address,
        zipcode: this.userProfile.zipcode,
        age: this.userProfile.age,
        gender: this.userProfile.gender
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
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
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
