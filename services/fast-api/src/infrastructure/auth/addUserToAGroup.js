// Import necessary modules from AWS SDK for Cognito Identity Provider
import { AdminAddUserToGroupCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

// Define an asynchronous function for user registration (sign-up)
const addUserToAGroup = async function (email, group) {
  // Create a Cognito Identity Provider Client with necessary configurations
  const client = new CognitoIdentityProviderClient({
    region: process.env.region, // Set the AWS region from environment variables
    credentials: {
      accessKeyId: process.env.accessKeyId,
      secretAccessKey: process.env.secretAccessKey,
    },
  });

  // Create a new SignUpCommand to register a new user
  const command = new AdminAddUserToGroupCommand({
    UserPoolId: process.env.UserPoolId, // Set the User Pool ID from environment variables
    Username: email, // Provide the username for the new user
    GroupName: group,
  });

  // Send the sign-up command to the Cognito service and return the result
  return client.send(command);
};

export { addUserToAGroup };
