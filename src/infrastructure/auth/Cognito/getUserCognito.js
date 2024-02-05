// Import necessary modules from AWS SDK for Cognito Identity Provider
import { AdminGetUserCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { config } from '../../../aws/config.js';

// Define an asynchronous function for user registration (sign-up)
const getUser = async function (email) {
  // Create a Cognito Identity Provider Client with necessary configurations
  const client = new CognitoIdentityProviderClient(config);

  // Create a new SignUpCommand to register a new user
  const command = new AdminGetUserCommand({
    UserPoolId: process.env.USER_POOL_ID, // Set the User Pool ID from environment variables
    Username: email,
  });

  try {
    // Send the sign-up command to the Cognito service and return the result
    const response = await client.send(command);
    const userAttr = response.UserAttributes.find((user) => {
      if (user.Name === 'email') {
        return user;
      }
    });

    return userAttr.Value;
  } catch (e) {
    throw new Error('Error trying to get user');
  }
};

export { getUser };
