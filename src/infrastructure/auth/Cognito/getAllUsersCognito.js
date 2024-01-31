// Import necessary modules from AWS SDK for Cognito Identity Provider
import { ListUsersCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

// Define an asynchronous function for user registration (sign-up)
const getAllUsers = async function () {
  // Create a Cognito Identity Provider Client with necessary configurations
  const client = new CognitoIdentityProviderClient({
    region: process.env.region, // Set the AWS region from environment variables
    credentials: {
      accessKeyId: process.env.accessKeyId,
      secretAccessKey: process.env.secretAccessKey,
    },
  });

  // Create a new SignUpCommand to register a new user
  const command = new ListUsersCommand({
    UserPoolId: process.env.UserPoolId, // Set the User Pool ID from environment variables
  });

  // Send the sign-up command to the Cognito service and return the result
  try {
    const response = await client.send(command);
    return response;
  } catch (e) {
    throw new Error('Unexpected error has occurred: ', e.message);
  }
};

export { getAllUsers };
