import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const initiateAuth = async function ({ email, password }) {
  // Validate required environment variables
  if (!process.env.region || !process.env.userPoolId || !process.env.ClientId) {
    throw new Error('Missing required environment variables');
  }

  try {
    // Create a Cognito Identity Provider Client with necessary configurations
    const client = new CognitoIdentityProviderClient({
      region: process.env.region,
      userPoolId: process.env.userPoolId,
    });

    // Create a new InitiateAuthCommand to initiate authentication
    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
      ClientId: process.env.ClientId,
    });

    const response = await client.send(command);
    return response;
  } catch (e) {
    // Log the error using a logging library or console.log
    throw new Error('An error occurred during authentication:', e.message);
  }
};

export { initiateAuth };
