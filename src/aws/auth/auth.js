import { getUser, initiateAuth } from './Cognito/index.js';
import { isValidEmail, decryptingPassword, tokenVerifier } from './Cognito/userValidation/index.js';
import jwt from 'jsonwebtoken';
import { logger } from '../../infrastructure/server.js';
import { AuthenticationError } from '../../utils/error-handling/CustomErrors.js';

const authLogin = async (input) => {
  try {
    // Decrypting password which came from frontend
    const decryptedData = await decryptingPassword(input);
    const { email, password } = decryptedData;
    //const verifyUserPassword = isValidPassword(password, email);
    const verifyUserEmail = isValidEmail(email);

    // If they are, it's time to call cognito function to initiate
    // cognito authentication function with inputs
    if (verifyUserEmail) {
      const response = await initiateAuth({ email, password });
      const token = {
        idToken: response.AuthenticationResult.IdToken,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
      };
      // Confirming if the response of the request was successfully
      if (response.$metadata.httpStatusCode === 200) {
        return {
          token,
          user: {
            email,
          },
        };
      } else {
        return new Error('Server error');
      }
    }
  } catch (e) {
    logger.error('An error occurred during authentication:', e.message);
    throw e; // Rethrow the error to propagate it up the call stack
  }
};

//TODO: This can be improved
const auth = async (req) => {
  const token = req.headers.authorization;

  // To verify if the operation is login
  if (req.body.operationName === 'Authorize') {
    return {
      authLogin,
    };
  }

  if (!token) {
    throw new AuthenticationError('You dont have token to query');
  }
  const tokenWithoutPrefix = token.split(' ')[1]; // Bearer agsgsshjagsdhgahsd

  try {
    // Verifying AWS jwt to see if it is correct
    const jwtResponse = await tokenVerifier(tokenWithoutPrefix);

    // inserted in autohorization field
    if (jwtResponse) {
      try {
        const { username } = jwt.decode(tokenWithoutPrefix);

        // Calling getUserCognito function to compare the email
        // inside the token with a Cognito user email
        const currentUser = await getUser(username);

        return {
          currentUser,
        };
      } catch (e) {
        throw new Error('Error trying to decode');
      }
    }
    throw new Error();
  } catch (error) {
    throw new AuthenticationError('invalid authorization token');
  }
};

export { auth, authLogin };
