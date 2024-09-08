import gql from 'graphql-tag';


// Mutation for registering a new user
export const REGISTER_USER = gql`
  mutation RegisterUser(
    $firstName: String!,
    $lastName: String!,
    $email: String!,
    $password: String!,
    $phoneNumber: String,
    $address: String!,
    $zipcode: String!,
    $age: Int!,
    $gender: String!
  ) {
    registerUser(
      firstName: $firstName,
      lastName: $lastName,
      email: $email,
      password: $password,
      phoneNumber: $phoneNumber,
      address: $address,
      zipcode: $zipcode,
      age: $age,
      gender: $gender
    ) {
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
