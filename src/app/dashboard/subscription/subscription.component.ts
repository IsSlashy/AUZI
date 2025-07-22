import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Assurez-vous que CommonModule est importé
import { Apollo } from 'apollo-angular';
import { GET_USER_PROFILE } from '../../GraphQL/profile';
import { GET_SUBSCRIPTION } from '../../GraphQL/stripe';
import { Subscription } from '../../types/stripe.types';

@Component({
    selector: 'app-subscription',
    imports: [CommonModule], // Ajout de CommonModule pour les pipes Angular comme 'date'
    templateUrl: './subscription.component.html',
    styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  subscriptions: Subscription[] = []; // Utilisation correcte du type Subscription
  isLoading = true;
  errorMessage = '';

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.loadUserAndSubscriptions();
  }

  async loadUserAndSubscriptions(): Promise<void> {
    try {
      this.isLoading = true;

      // Étape 1 : Récupérer les informations utilisateur
      const userResult = await this.apollo.query<{ users: any[] }>({
        query: GET_USER_PROFILE,
      }).toPromise();

      const user = userResult?.data?.users?.[0];
      if (!user || !user.stripeCustomerId) {
        this.errorMessage = "Stripe customer ID introuvable pour l'utilisateur.";
        return;
      }

      // Étape 2 : Charger les abonnements avec le stripeCustomerId
      const subscriptionResult = await this.apollo.query<{ getCustomerSubscriptions: Subscription[] }>({
        query: GET_SUBSCRIPTION,
        variables: { customerId: user.stripeCustomerId },
      }).toPromise();

      this.subscriptions = subscriptionResult?.data?.getCustomerSubscriptions || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des abonnements:', error);
      this.errorMessage = 'Échec de la récupération des abonnements.';
    } finally {
      this.isLoading = false;
    }
  }
}
