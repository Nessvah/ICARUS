// Import necessary modules from AWS SDK for Cognito Identity Provider
import {
  AdminListGroupsForUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

// Define an asynchronous function for user registration (sign-up)
const getUserRoles = async function (email) {
  // Create a Cognito Identity Provider Client with necessary configurations
  const client = new CognitoIdentityProviderClient({
    region: process.env.region, // Set the AWS region from environment variables
    credentials: {
      accessKeyId: process.env.accessKeyId,
      secretAccessKey: process.env.secretAccessKey,
    },
  });

  // Create a new SignUpCommand to register a new user
  const command = new AdminListGroupsForUserCommand({
    UserPoolId: process.env.UserPoolId, // Set the User Pool ID from environment variables
    ClientId: process.env.ClientId, // Set the Client ID from environment variables
    Username: email, // Provide the username for the new user
  });

  // Send the sign-up command to the Cognito service and return the result
  try {
    const response = await client.send(command);
    return response;
  } catch (error) {
    if (error.name === 'UserNotFoundException') {
      // Handle the UserNotFoundException specifically
      throw new Error('User not found:', error.message);
      // Additional handling logic here
    } else {
      // Handle other types of exceptions
      throw new Error('An error occurred:', error.message);
    }
  }
};
export { getUserRoles };