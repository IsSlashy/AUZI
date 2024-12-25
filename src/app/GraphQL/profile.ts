import gql from 'graphql-tag';

export const GET_USER_PROFILE = gql`
  query GetUser {
    users {
      id
      firstName
      lastName
      email
      phoneNumber
      address
      zipcode
      age
      gender
      createdAt # Ajouté pour inclure la date de création
      updatedAt # Ajouté pour inclure la date de mise à jour
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      firstName
      lastName
      email
      phoneNumber
      address
      zipcode
      age
      gender
      updatedAt # Ajouté pour recevoir la dernière date de mise à jour
    }
  }
`;

export const GET_USER_FIRSTNAME = gql`
  query GetMe {
    me {
      id # Facultatif
      firstName
    }
  }
`;

export const GET_USER_DOCUMENTS = gql`
query GetUserDocuments($userId: ID!) {
  getUserDocuments(userId: $userId) {
    id
    name
    content
  }
}
`;
