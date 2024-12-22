// src/app/services/stripe.service.ts
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { CREATE_SUBSCRIPTION, GET_SUBSCRIPTION } from '../GraphQL/stripe';
import { SubscriptionResponse, SubscriptionData, CreateSubscriptionVariables } from '../types/stripe.types';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise: Promise<Stripe | null>;
  private cardElement: StripeCardElement | null = null;

  constructor(private apollo: Apollo) {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  async createSubscription(userId: number, priceId: string) {
    try {
      const response = await this.apollo.mutate<SubscriptionResponse>({
        mutation: CREATE_SUBSCRIPTION,
        variables: {
          userId,
          priceId
        } as CreateSubscriptionVariables
      }).toPromise();

      const subscriptionData = response?.data?.createSubscription;
      if (!subscriptionData || !subscriptionData.clientSecret) {
        throw new Error('No client secret received');
      }

      const stripe = await this.stripePromise;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      const cardElement = await this.getCardElement();
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      return await stripe.confirmCardPayment(subscriptionData.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // Ajoutez les détails de facturation si nécessaire
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'abonnement:', error);
      throw error;
    }
  }

  async getSubscription(subscriptionId: string) {
    return this.apollo.query<SubscriptionData>({
      query: GET_SUBSCRIPTION,
      variables: { subscriptionId }
    }).toPromise();
  }

  setCardElement(element: StripeCardElement) {
    this.cardElement = element;
  }

  private async getCardElement(): Promise<StripeCardElement> {
    if (!this.cardElement) {
      throw new Error('Card element not initialized');
    }
    return this.cardElement;
  }
}
