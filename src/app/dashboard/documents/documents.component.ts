import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import gql from 'graphql-tag';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent {
  documents: any[] = []; // Liste des documents uploadés
  selectedFile: File | null = null; // Fichier sélectionné par l'utilisateur
  filePreviewUrl: SafeResourceUrl | null = null; // URL sécurisée pour afficher un aperçu PDF

  constructor(private apollo: Apollo, public sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.loadDocuments();
  }

  // Récupère l'ID de l'utilisateur depuis le localStorage
  getCurrentUserId(): string | null {
    if (typeof window === 'undefined') {
      console.error('localStorage n\'est pas disponible dans cet environnement.');
      return null;
    }

    const userId = localStorage.getItem('user-id');
    if (!userId) {
      console.error('Aucun utilisateur connecté.');
      return null;
    }

    console.log('ID utilisateur récupéré :', userId);
    return userId;
  }

  // Charge les documents de l'utilisateur
  loadDocuments() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('Erreur : Aucun utilisateur connecté.');
      return;
    }

    this.apollo
      .query({
        query: gql`
          query GetUserDocuments($userId: ID!) {
            getUserDocuments(userId: $userId) {
              id
              name
              content
            }
          }
        `,
        variables: { userId },
      })
      .subscribe(
        (result: any) => {
          this.documents = result.data.getUserDocuments;
        },
        (error) => {
          console.error('Erreur lors de la récupération des documents :', error);
        }
      );
  }

  // Gère la sélection d'un fichier par l'utilisateur
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const fileUrl = URL.createObjectURL(this.selectedFile); // Génère l'URL temporaire
      this.filePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl); // Sécurise l'URL pour Angular
    }
  }

  // Upload un document pour l'utilisateur
  uploadDocument() {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier.');
      return;
    }

    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('Erreur : Aucun utilisateur connecté.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const file = this.selectedFile;
      this.apollo
        .mutate({
          mutation: gql`
            mutation UploadUserDocument($file: Upload!, $userId: ID!) {
              uploadUserDocument(file: $file, userId: $userId) {
                id
                name
              }
            }
          `,
          variables: { file, userId },
          context: { useMultipart: true }, // Active les uploads multipart
        })
        .subscribe(
          () => {
            alert('Document uploadé avec succès.');
            this.loadDocuments();
            this.clearFileSelection(); // Réinitialise la sélection après upload
          },
          (error) => {
            console.error('Erreur lors de l\'upload du document :', error);
          }
        );
    };
    reader.readAsDataURL(this.selectedFile);
  }

  // Affiche un document PDF dans une nouvelle fenêtre
  viewDocument(document: any) {
    const content = atob(document.content);
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }

  // Supprime un document de la liste de l'utilisateur
  deleteDocument(documentId: number) {
    this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteUserDocument($documentId: ID!) {
            deleteUserDocument(documentId: $documentId) {
              success
              message
            }
          }
        `,
        variables: { documentId },
      })
      .subscribe(
        () => {
          alert('Document supprimé avec succès.');
          this.loadDocuments();
        },
        (error) => {
          console.error('Erreur lors de la suppression du document :', error);
        }
      );
  }

  // Réinitialise la sélection du fichier et l'URL de l'aperçu
  clearFileSelection() {
    this.selectedFile = null;
    this.filePreviewUrl = null;
  }
}
