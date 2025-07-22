// src/GraphQL/connexion.ts
import { gql } from 'apollo-angular';

/* -------------------- Fragments réutilisables -------------------- */
export const USER_MINI = gql`
  fragment UserMini on User {
    id
    firstName
    lastName
    email
  }
`;

/* --------------------------- Mutations --------------------------- */

/**
 * Inscription classique
 */
export const REGISTER_USER = gql`
  mutation RegisterUser(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $phoneNumber: String
    $address: String!
    $zipcode: String!
    $age: Int!
    $gender: String!
  ) {
    registerUser(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
      phoneNumber: $phoneNumber
      address: $address
      zipcode: $zipcode
      age: $age
      gender: $gender
    ) {
      ...UserMini
    }
  }
  ${USER_MINI}
`;

/**
 * Connexion email / mot de passe
 * (forme attendue par ton schéma actuel: input: AuthenticateUserInput!)
 */
export const AUTHENTICATE_USER = gql`
  mutation Auth($email: String!, $password: String!) {
    authenticateUser(input: { email: $email, password: $password }) {
      token
      user {
        ...UserMini
      }
    }
  }
  ${USER_MINI}
`;

/**
 * Variante si tu préfères passer l’input tel quel depuis le composant :
 * (Décommente si tu veux l’utiliser)
 */
// export const AUTHENTICATE_USER_INPUT = gql`
//   mutation AuthenticateUser($input: AuthenticateUserInput!) {
//     authenticateUser(input: $input) {
//       token
//       user {
//         ...UserMini
//       }
//     }
//   }
//   ${USER_MINI}
// `;

/**
 * ✅ UNIQUEMENT si la mutation existe dans ton backend.
 * Si elle n’existe pas, commente / supprime.
 */
export const AUTHENTICATE_USER_WITH_GOOGLE = gql`
  mutation AuthenticateUserWithGoogle($googleToken: String!) {
    authenticateUserWithGoogle(googleToken: $googleToken) {
      token
      user {
        ...UserMini
      }
    }
  }
  ${USER_MINI}
`;
