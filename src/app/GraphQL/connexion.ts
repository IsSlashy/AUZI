import gql from 'graphql-tag';

// Mutation for creating a new user
export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      user {
        id
        firstName
        lastName
        email
        roleId
        # Add other fields as needed
      }
    }
  }
`;

// Mutation for authenticating a user (login)
export const AUTHENTICATE_USER = gql`
  mutation AuthenticateUser($email: String!, $password: String!) {
    authenticateUser(email: $email, password: $password) {
      accessToken
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;
