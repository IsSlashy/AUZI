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
  documents: Array<{ id: string; name: string; content: string }> = []; // Liste des documents utilisateur
  selectedFile: File | null = null; // Fichier sélectionné
  filePreviewUrl: SafeResourceUrl | null = null; // URL sécurisée pour l'aperçu PDF

  constructor(private apollo: Apollo, public sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.loadDocuments();
  }

  /**
   * Récupère l'ID utilisateur depuis le localStorage
   */
  private getCurrentUserId(): string | null {
    const userId = localStorage.getItem('user-id');
    if (!userId) {
      console.error('Aucun utilisateur connecté.');
      return null;
    }
    return userId;
  }

  /**
   * Charge les documents de l'utilisateur
   */
  loadDocuments() {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const GET_USER_DOCUMENTS = gql`
      query GetUserDocuments($userId: ID!) {
        getUserDocuments(userId: $userId) {
          id
          name
          content
        }
      }
    `;

    this.apollo
      .query<{ getUserDocuments: Array<{ id: string; name: string; content: string }> }>({
        query: GET_USER_DOCUMENTS,
        variables: { userId },
      })
      .subscribe(
        ({ data }) => {
          this.documents = data?.getUserDocuments || [];
          console.log('Documents chargés :', this.documents);
        },
        (error) => console.error('Erreur lors du chargement des documents :', error)
      );
  }

  /**
   * Gère la sélection de fichier
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
      this.filePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(this.selectedFile)
      );
    }
  }

  /**
   * Upload un document utilisateur
   */
  uploadDocument() {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    fetch('https://api.auzi.fr/upload', {
      method: 'POST',
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Erreur réseau : ' + response.status);
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error('Erreur serveur : ' + (data.message || 'Inconnue'));
        }
        alert('Document uploadé avec succès.');
        this.loadDocuments();
        this.clearFileSelection();
      })
      .catch((error) => {
        console.error('Erreur lors de l\'upload du document :', error);
        alert('Une erreur s\'est produite lors de l\'upload.');
      });
  }

  /**
   * Affiche un document PDF
   */
  viewDocument(document: { content: string }) {
    const content = atob(document.content);
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  /**
   * Supprime un document
   */
  deleteDocument(documentId: string) {
    const DELETE_DOCUMENT = gql`
      mutation DeleteUserDocument($documentId: ID!) {
        deleteUserDocument(documentId: $documentId) {
          success
          message
        }
      }
    `;

    this.apollo
      .mutate<{ deleteUserDocument: { success: boolean; message: string } }>({
        mutation: DELETE_DOCUMENT,
        variables: { documentId },
      })
      .subscribe(
        ({ data }) => {
          if (data?.deleteUserDocument.success) {
            alert('Document supprimé avec succès.');
            this.loadDocuments();
          } else {
            alert('Erreur lors de la suppression du document.');
          }
        },
        (error) => console.error('Erreur lors de la suppression du document :', error)
      );
  }

  /**
   * Réinitialise la sélection de fichier
   */
  clearFileSelection() {
    this.selectedFile = null;
    this.filePreviewUrl = null;
  }
}
