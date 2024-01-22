// Import necessary modules from AWS SDK for Cognito Identity Provider
import { SignUpCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

// Define an asynchronous function for user registration (sign-up)
const signUp = async function ({ input }) {
  // Create a Cognito Identity Provider Client with necessary configurations
  const client = new CognitoIdentityProviderClient({
    region: process.env.region, // Set the AWS region from environment variables
    userPoolId: process.env.userPoolId, // Set the User Pool ID from environment variables
  });

  const usersAttributes = [
    {
      Name: 'custom:role_id',
      Value: '1',
    },
  ];
  // Create a new SignUpCommand to register a new user
  const command = new SignUpCommand({
    ClientId: process.env.ClientId, // Set the Client ID from environment variables
    Username: input.email, // Provide the username for the new user
    Password: input.password, // Provide the password for the new user
    UserAttributes: usersAttributes,
  });

  // Send the sign-up command to the Cognito service and return the result
  return client.send(command);
};

export { signUp };
