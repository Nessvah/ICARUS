import { getUser, initiateAuth } from './Cognito/index.js';
import { isValidEmail, decryptingPassword, tokenVerifier } from './Cognito/userValidation/index.js';
// import {
//   createUser,
//   findAllRoles,
//   findAllUsers,
//   findCurrentUser,
//   createNewRole,
//   addRoleUser,
// } from '../../models/usersModel.js';
//import { AuthorizationError } from '../../utils/error-handling/CustomErrors.js';
import jwt from 'jsonwebtoken';
import { logger } from '../../infrastructure/server.js';

const authLogin = async (input) => {
  try {
    //* I'm incrypting the information which comes from frontend here to test
    //* but the encryptation is made on frontend
    // const publicKey = process.env.publicKeyFrontend;
    //const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(input.password));

    // Decrypting password which came from frontend
    const decryptedData = await decryptingPassword(input);
    const { email, password } = decryptedData;
    // // Verifying password and email from frontend to see if they are standardized
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

  if (!token) {
    return {
      authLogin,
    };
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
  } catch (error) {
    logger.error(`invalid authorization token`);
  }
};

export { auth };
