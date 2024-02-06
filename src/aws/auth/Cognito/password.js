// Import necessary modules from AWS SDK for Cognito Identity Provider
import { AdminSetUserPasswordCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { config } from '../../config/config.js';

// Define an asynchronous function for user registration (sign-up)
const resetUserPasswordCommand = async function ({ username }) {
  // Create a Cognito Identity Provider Client with necessary configurations
  const client = new CognitoIdentityProviderClient(config);

  // Create a new SignUpCommand to register a new user
  const command = new AdminSetUserPasswordCommand({
    UserPoolId: process.env.UserPoolId, // Set the User Pool ID from environment variables
    Username: username, // Provide the username for the new user,
    Password: '@Senha1234',
  });

  // Send the sign-up command to the Cognito service and return the result
  return client.send(command);
};

try {
  // Call the signUp function with the provided username and password
  resetUserPasswordCommand({ username: 'maldonado.pe@hotmail.com' })
    .then((response) => {
      return response;
    }) // Log the response if registration is successful
    .catch((error) => {
      throw new Error(error);
    }); // Log any errors that occur during registration
} catch (e) {
  throw new Error(e);
}
