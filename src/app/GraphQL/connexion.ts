import gql from 'graphql-tag';

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      id
      firstName
      lastName
      email
    }
  }
`;

export const AUTHENTICATE_USER = gql`
  mutation AuthenticateUser($input: AuthenticateUserInput!) {
    authenticateUser(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;
