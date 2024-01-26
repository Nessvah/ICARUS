// Import necessary modules from AWS SDK for Cognito Identity Provider
import { SignUpCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

// Define an asynchronous function for user registration (sign-up)
const signUp = async function (input) {
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
  try {
    const response = await client.send(command);
    return response.$metadata.httpStatusCode;
  } catch (e) {
    // Check if the error is a UsernameExistsException
    if (e.name === 'UsernameExistsException') {
      throw new Error('Username already exists');
    } else if (e.name === 'InvalidParameterException') {
      throw new Error(`Password or email don't meet the requirements`);
    }
  }
};

export { signUp };
