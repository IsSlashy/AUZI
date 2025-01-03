import { gql } from 'apollo-angular';

export const GET_USER_SETTINGS = gql`
query GetUserSettings($userId: ID!) {
  getUserSettings(userId: $userId) {
    id
    privacyLevel
    emailVisibility
    phoneVisibility
  }
}
`;

export const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($userId: ID!, $input: UpdateUserSettingsInput!) {
    updateUserSettings(userId: $userId, input: $input) {
      id
      privacyLevel
      emailVisibility
      phoneVisibility
    }
  }
`;
