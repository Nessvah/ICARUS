// Import necessary modules from AWS SDK for Cognito Identity Provider
import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

/* // Retrieve values from environment variables
const username = process.env.userIdentifier; // Get the username from environment variables
const password = process.env.PASSWORD; // Get the password from environment variables */

// Define an asynchronous function for initiating authentication
const initiateAuth = async function ({ email, password }) {
  // Create a Cognito Identity Provider Client with necessary configurations
  const client = new CognitoIdentityProviderClient({
    region: process.env.region, // Set the AWS region from environment variables
    userPoolId: process.env.userPoolId, // Set the User Pool ID from environment variables
  });

  // Create a new InitiateAuthCommand to initiate authentication
  const command = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH, // Specify the authentication flow type
    AuthParameters: {
      USERNAME: email, // Provide the username
      PASSWORD: password, // Provide the password
    },
    ClientId: process.env.ClientId, // Set the Client ID from environment variables
  });

  // Send the authentication command to the Cognito service and return the result
  return client.send(command);
};

export { initiateAuth };
