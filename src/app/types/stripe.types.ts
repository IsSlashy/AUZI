// src/app/types/stripe.types.ts
export interface SubscriptionResponse {
  createSubscription: {
    subscriptionId: string;
    clientSecret: string;
    status: string;
  };
}

export interface SubscriptionData {
  getSubscription: {
    id: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
}

export interface CreateSubscriptionVariables {
  userId: number;
  priceId: string;
}
