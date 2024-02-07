import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { logger } from '../../../infrastructure/server.js';

const { REGION, USER_POOL_ID, CLIENT_ID } = process.env;
const initiateAuth = async function ({ email, password }) {
  // Validate required environment variables
  if (!REGION || !USER_POOL_ID || !CLIENT_ID) {
    throw new Error('Missing required environment variables');
  }

  try {
    // Create a Cognito Identity Provider Client with necessary configurations
    const client = new CognitoIdentityProviderClient({
      region: REGION,
      userPoolId: USER_POOL_ID,
    });

    // Create a new InitiateAuthCommand to initiate authentication
    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
      ClientId: CLIENT_ID,
    });

    const response = await client.send(command);
    return response;
  } catch (e) {
    // Log the error using a logging library or console.log
    logger.error('cognito error');
    throw new Error('An error occurred during authentication:', e.message);
  }
};

export { initiateAuth };
