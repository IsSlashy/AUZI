import gql from 'graphql-tag';

export const GET_USER_SETTINGS = gql`
  query GetUserSettings($userId: ID!) {
    userSettings(userId: $userId) {
      id
      privacy_level
      email_visibility
      phone_visibility
    }
  }
`;

export const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($input: UpdateUserSettingsInput!) {
    updateUserSettings(input: $input) {
      id
      privacy_level
      email_visibility
      phone_visibility
    }
  }
`;
