import { gql } from 'apollo-angular';

/* --------- Fragments ---------- */
export const USER_MINI = gql`
  fragment UserMini on User {
    id
    firstName
    lastName
    email
  }
`;

/* --------- Mutations ---------- */
export const AUTHENTICATE_USER = gql`
  mutation AuthenticateUser($input: AuthenticateUserInput!) {
    authenticateUser(input: $input) {
      accessToken
      refreshToken
      user {
        ...UserMini
      }
    }
  }
  ${USER_MINI}
`;

export const AUTHENTICATE_USER_WITH_GOOGLE = gql`
  mutation AuthenticateUserWithGoogle($input: GoogleAuthInput!) {
    authenticateUserWithGoogle(input: $input) {
      accessToken
      refreshToken
      user {
        ...UserMini
      }
      isNewUser
    }
  }
  ${USER_MINI}
`;

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
