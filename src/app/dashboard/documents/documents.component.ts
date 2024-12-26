import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import gql from 'graphql-tag';

// ==== IMPORTATION de PDF.js ====
import * as pdfjsLib from 'pdfjs-dist';

// IMPORTANT : pointer vers le worker PDF.js
// Assure-toi que 'assets/pdf.worker.min.js' soit le bon chemin dans ton projet.
pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/pdf.worker.min.js';


@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent {
  // Liste de documents (chacun possède un id, un name et son content en base64)
  documents: Array<{ id: string; name: string; content: string }> = [];

  // Fichier sélectionné
  selectedFile: File | null = null;

  // URL sécurisée pour prévisualiser le PDF avant upload (optionnel)
  filePreviewUrl: SafeResourceUrl | null = null;

  constructor(
    private apollo: Apollo,
    public sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  /**
   * -------------------------------
   * Récupère l'ID utilisateur depuis le localStorage si disponible
   */
  private getCurrentUserId(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('localStorage is not available in this environment');
      return null;
    }
    const userId = localStorage.getItem('user-id');
    if (!userId) {
      console.error('Aucun utilisateur connecté.');
      return null;
    }
    return userId;
  }

  /**
   * -------------------------------
   * Charge les documents de l'utilisateur (depuis l'API GraphQL)
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
   * -------------------------------
   * Gère la sélection d'un fichier à uploader
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];

      // Création d'une URL locale pour prévisualiser (optionnel)
      this.filePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(this.selectedFile)
      );
    }
  }

  /**
   * -------------------------------
   * Upload d'un document PDF
   */
  uploadDocument() {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier.');
      return;
    }

    const userId = this.getCurrentUserId();
    if (!userId) {
      alert('Utilisateur non connecté.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('userId', userId);

    // Log des données envoyées (debug)
    console.log('Envoi des données :', {
      fileName: this.selectedFile.name,
      fileType: this.selectedFile.type,
      userId,
    });

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

        // Recharge la liste
        this.loadDocuments();

        // Réinitialise l’input file
        this.clearFileSelection();
      })
      .catch((error) => {
        console.error("Erreur lors de l'upload du document :", error);
        alert("Une erreur s'est produite lors de l'upload.");
      });
  }

  /**
   * -------------------------------
   * Affiche le PDF dans un nouvel onglet
   * (Le PDF est reçu en base64, on le convertit en Blob)
   */
  viewDocument(document: { content: string }) {
    try {
      if (!document.content) {
        throw new Error('Le contenu du document est vide.');
      }

      // Décodage Base64 -> string binaire
      const rawData = atob(document.content);

      // Convertit la string en un tableau d’octets
      const byteArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        byteArray[i] = rawData.charCodeAt(i);
      }

      // Crée le blob PDF correct
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Ouvre le PDF dans un nouvel onglet
      window.open(url, '_blank');
    } catch (error) {
      console.error("Erreur lors de l'affichage du document :", error);
      alert("Impossible d'afficher le document. Vérifiez son contenu.");
    }
  }

  /**
   * -------------------------------
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

            // Recharger la liste immédiatement
            this.loadDocuments();

            // OU, pour un effet instantané, on peut faire :
            // this.documents = this.documents.filter(doc => doc.id !== documentId);
          } else {
            alert('Erreur lors de la suppression du document.');
          }
        },
        (error) => console.error('Erreur lors de la suppression du document :', error)
      );
  }

  /**
   * -------------------------------
   * Réinitialise la sélection de fichier
   */
  clearFileSelection() {
    this.selectedFile = null;
    this.filePreviewUrl = null;
  }

  /**
   * -------------------------------
   * Génère dynamiquement un "CV type Australien" à partir du PDF (base64)
   * 1) Décoder le PDF (base64 -> Uint8Array)
   * 2) Extraire le texte PDF (avec pdfjs-dist)
   * 3) Formater dans un style "Australian Resume" pour de l'intérim weekly
   */
  async generateAustralianResume(document: { id: string; name: string; content: string }) {
    try {
      if (!document.content) {
        throw new Error('Le contenu du PDF est vide ou inexistant.');
      }

      // 1) base64 -> Uint8Array
      const pdfUint8 = this.base64ToUint8Array(document.content);

      // 2) Extraire le texte complet du PDF
      const pdfText = await this.extractTextFromPDF(pdfUint8);

      // 3) Analyser ce texte (identifier le nom, les expériences, etc.)
      const parsedData = this.parseCVData(pdfText);

      // 4) Construire un CV format "Aussie"
      const aussieCV = this.buildAustralianCV(parsedData);

      // 5) Simple affichage console + alert
      console.log('=== CV AUSTRALIEN GÉNÉRÉ ===\n', aussieCV);
      alert('CV Australien généré ! Consulte la console pour le voir.');

      // Optionnel : tu peux générer un PDF final (pdfmake, jspdf) ou l'envoyer à l'API
    } catch (error: any) {
      console.error('Erreur lors de la génération du CV australien :', error, error?.stack);
      alert('Impossible de générer le CV. Vérifie la console pour plus d\'infos.');
    }
  }

  /**
   * -------------------------------
   * Conversion base64 -> Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * -------------------------------
   * Extraction du texte PDF via pdfjs-dist
   */
  private async extractTextFromPDF(pdfData: Uint8Array): Promise<string> {
    // pdfjsLib.getDocument(...) retourne un "loadingTask"
    // il faut await ".promise" pour obtenir l'objet PDFDocumentProxy
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let finalText = '';

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Concaténation de tout le texte de la page
      textContent.items.forEach((item: any) => {
        if (item.str) {
          finalText += item.str + ' ';
        }
      });

      finalText += '\n'; // Séparation entre pages
    }

    return finalText;
  }

  /**
   * -------------------------------
   * Analyse (simple) du texte : nom, téléphone, expériences...
   */
  private parseCVData(pdfText: string): any {
    const lines = pdfText.split('\n').map(l => l.trim()).filter(l => l);

    // 1) Nom : on cherche "John Doe" (initiales capitales)
    const nameLine = lines.find(line => /^[A-Z][a-z]+(\s[A-Z][a-z]+)+$/.test(line)) || 'Unknown Name';

    // 2) Téléphone : on cherche +61 ou +33
    const phoneLine = lines.find(line => line.startsWith('+61') || line.startsWith('+33')) || 'Unknown Phone';

    // 3) Expérience : on cherche la section "Experience" ou "Expériences"
    const experienceIndex = lines.findIndex(line =>
      line.toLowerCase().includes('experience') || line.toLowerCase().includes('expériences')
    );
    let experiences: string[] = [];
    if (experienceIndex !== -1) {
      experiences = lines.slice(experienceIndex + 1, experienceIndex + 5);
    }

    return {
      name: nameLine,
      phone: phoneLine,
      experiences
    };
  }

  /**
   * -------------------------------
   * Construit un CV textuel "format Australien"
   */
  private buildAustralianCV(parsedData: any): string {
    const { name, phone, experiences } = parsedData;

    return `
=== AUSTRALIAN-STYLE RESUME (Interim / Weekly) ===

Full Name: ${name}
Contact Number: ${phone}
Availability: Immediately (Weekly / Temp)
Visa Status: [Ex: Working Holiday, Student, etc.]

=== PROFESSIONAL EXPERIENCE ===
${experiences.map((exp: string) => '• ' + exp).join('\n')}

=== KEY SKILLS ===
• Adaptability
• Quick Learner
• Team Collaboration
• Reliability
• Basic Aussie Workplace Safety

=== NOTES ===
- Tailored specifically for Australian temp agencies
- Focus on weekly availability & immediate start
- Keep it short & straightforward
`;
  }
}
