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
