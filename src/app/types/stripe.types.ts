// Réponse pour la mutation de création d'un abonnement
export interface SubscriptionResponse {
  createSubscription: {
    subscriptionId: string;
    clientSecret: string;
    status: string;
  };
}

// Réponse pour une seule souscription dans la requête GraphQL
export interface SubscriptionData {
  getSubscription: {
    id: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
}

// Réponse pour plusieurs abonnements (récupération dynamique via Stripe)
export interface SubscriptionData {
  getCustomerSubscriptions: Subscription[]; // Tableau de "Subscription"
}

// Modèle d'abonnement pour un client
export interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  priceId?: string; // Optionnel si pas toujours présent
}

// Variables pour la création d'un abonnement (mutation GraphQL)
export interface CreateSubscriptionVariables {
  userId: number;
  priceId: string;
}

// Variables pour récupérer les abonnements d'un client spécifique
export interface CustomerSubscriptionsVariables {
  customerId: string;
}
