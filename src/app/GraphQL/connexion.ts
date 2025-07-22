import { gql } from 'apollo-angular';

/* ---------- Fragments réutilisables ---------- */
export const USER_MINI = gql`
  fragment UserMini on User {
    id
    firstName
    lastName
    email
  }
`;

/* ---------- Mutations ---------- */
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

export const AUTHENTICATE_USER = gql`
  mutation AuthenticateUser($input: AuthenticateUserInput!) {
    authenticateUser(input: $input) {
      token
      user {
        ...UserMini
      }
    }
  }
  ${USER_MINI}
`;

/**
 * ➜ OPTIONNEL : à utiliser UNIQUEMENT si la mutation existe dans ton schéma backend.
 *    Sinon, commente ou supprime cette mutation.
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
