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
    }
  }
`;
