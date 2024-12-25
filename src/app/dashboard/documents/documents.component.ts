import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import gql from 'graphql-tag';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent {
  documents: any[] = [];
  selectedFile: File | null = null;

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.loadDocuments();
  }

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
        variables: {
          userId,
        },
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

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
          variables: {
            file,
            userId,
          },
          context: {
            useMultipart: true, // Nécessaire pour le fichier
          },
        })
        .subscribe(
          () => {
            alert('Document uploadé avec succès.');
            this.loadDocuments();
          },
          (error) => {
            console.error('Erreur lors de l\'upload du document :', error);
          }
        );
    };
    reader.readAsDataURL(this.selectedFile);
  }

  viewDocument(document: any) {
    const content = atob(document.content);
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }

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
        variables: {
          documentId,
        },
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
}
