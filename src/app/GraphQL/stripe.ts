// src/app/GraphQL/stripe.ts
import { gql } from 'apollo-angular';

export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($userId: Int!, $priceId: String!) {
    createSubscription(userId: $userId, priceId: $priceId) {
      subscriptionId
      clientSecret
      status
    }
  }
`;

export const GET_SUBSCRIPTION = gql`
query GetCustomerSubscriptions($customerId: String!) {
  getCustomerSubscriptions(customerId: $customerId) {
    id
    status
    currentPeriodEnd
    cancelAtPeriodEnd
    priceId
  }
}
`;
