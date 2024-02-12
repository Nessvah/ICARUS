import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { logger } from '../../../../infrastructure/server.js';

const { USER_POOL_ID, CLIENT_ID } = process.env;

/**
 * This function will take the accessToken provided by aws cognito
 * and will return the response if it's valid or not.
 * @param {string} accessToken
 * @returns {boolean} true if the token is valid, false otherwise
 */
const tokenVerifier = async function (accessToken) {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: USER_POOL_ID,
    tokenUse: 'access',
    clientId: CLIENT_ID,
  });

  try {
    const payload = await verifier.verify(accessToken);
    logger.info('Token is valid. Payload: ', payload);
    return true;
  } catch (e) {
    logger.error('Token is invalid: ', e);
    throw new Error('Error in token validation: ', e);
  }
};

export { tokenVerifier };
