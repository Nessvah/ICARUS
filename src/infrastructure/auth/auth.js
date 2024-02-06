import { getAllUsers, getUser, initiateAuth, signUp } from './Cognito/index.js';
import { isValidEmail } from './Cognito/userValidation/emailValidation.js';
import { decryptingPassword } from './Cognito/userValidation/decrypt.js';
import { tokenVerifier } from './Cognito/userValidation/jwtVerifier.js';
import { AuthorizationError } from '../../utils/error-handling/CustomErrors.js';
import jwt from 'jsonwebtoken';
import { logger } from '../server.js';

export const users = [
  {
    id: '1',
    email: 'piparo@example.com',
    password: 'pass123',
    roles: [
      { id: '1', role: 'admin' },
      { id: '2', role: 'manager' },
    ],
    idCostumer: 'Cust1',
    created: '2022-01-01T10:00:00Z',
  },
  {
    id: '2',
    email: 'andre@example.com',
    password: 'pass456',
    roles: [
      { id: '2', role: 'manager' },
      { id: '3', role: 'intern' },
    ],
    idCostumer: 'Cust2',
    created: '2022-02-15T14:30:00Z',
  },
  {
    id: '3',
    email: 'claudia@example.com',
    password: 'pass789',
    roles: [{ id: '1', role: 'admin' }],
    idCostumer: 'Cust3',
    created: '2022-03-21T09:45:00Z',
  },
  {
    id: '4',
    email: 'soraia@example.com',
    password: 'passabc',
    roles: [{ id: '3', role: 'intern' }],
    idCostumer: 'Cust4',
    created: '2022-04-02T18:20:00Z',
  },
  {
    id: '5',
    email: 'admin@example.com',
    password: 'admin123',
    roles: [{ id: '3', role: 'intern' }],
    idCostumer: 'Cust14',
    created: '2022-04-02T18:20:00Z',
  },
];

const roles = [
  { id: '1', role: 'admin' },
  { id: '2', role: 'manager' },
  { id: '3', role: 'intern' },
];

const createUser = async (input) => {
  try {
    //* I'm incrypting the information which comes from frontend here to test
    //* but the encryptation is made on frontend
    /* const publicKey = process.env.publicKeyFrontend;
    const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(input.password)); */

    // Decrypting password which came from frontend
    const decryptedData = await decryptingPassword(input.password);
    const { email } = decryptedData;
    // Verifying password and email from frontend to see if they are standardized
    //const verifyUserPassword = isValidPassword((await decryptedData).password);
    const verifyUserEmail = isValidEmail(email);

    // If they are, it's time to call cognito function to add them
    if (verifyUserEmail) {
      // Sending signUp request to Cognito with user inputs (email, password)
      const responseStatusCode = await signUp(decryptedData);
      logger.info(`User createad successfully! Status code: ${responseStatusCode}`);
      // If user sign up is successfully, createdUser receives input.email
      const userResponse = await getUser(email);
      const emailAttribute = userResponse.UserAttributes.find((Attribute) => Attribute.Name === 'email');
      const emailValue = emailAttribute ? emailAttribute.Value : null;
      const roleAttribute = userResponse.UserAttributes.find((Attribute) => Attribute.Name === 'custom:role');
      const roleValue = roleAttribute ? roleAttribute.Value : null;
      const user = {
        role: roleValue,
        email: emailValue,
        created: userResponse.UserCreateDate,
      };
      return {
        user,
      };
    } else {
      return {
        message: 'Email or Password not compliant with standard required',
      };
    }
  } catch (e) {
    logger.error('Error creating user: ', e);
    return {
      error: 'User creation failed',
    };
  }
};

const findAllUsers = async () => {
  try {
    // Search all users in cognito user pool
    const allUsersResponse = await getAllUsers();
    // Making a transformation into the data to screen it
    const users = allUsersResponse.Users.map((user) => {
      const created = user.UserCreateDate;
      const emailAttribute = user.Attributes.find((Attribute) => Attribute.Name === 'email');
      const emailValue = emailAttribute ? emailAttribute.Value : null;

      const dateStr = created.toString();
      return {
        email: emailValue,
        created: dateStr,
      };
    });

    return users;
  } catch (e) {
    logger.error('An error has occurred: ', e);
    throw e;
  }
};

const findAllRoles = () => {
  return roles;
};

const findCurrentUser = async (currentUser) => {
  // Getting current user information on user pool
  const loggedUser = await getUser(currentUser);
  // Making transformations to screen it
  const emailAttribute = loggedUser.UserAttributes.find((Attribute) => Attribute.Name === 'email');
  const emailValue = emailAttribute ? emailAttribute.Value : null;
  const roleAttribute = loggedUser.UserAttributes.find((Attribute) => Attribute.Name === 'custom:role');
  const roleValue = roleAttribute ? roleAttribute.Value : null;
  const user = {
    role: roleValue,
    email: emailValue,
    created: loggedUser.UserCreateDate,
  };
  return user;
};

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

const createNewRole = ({ role }) => {
  const newRole = { id: Math.floor(Math.random() * 10000).toString(), role };
  roles.push(newRole);
  return newRole;
};

const addRoleUser = (input) => {
  const roleExist = roles.find((role) => role.role === input.role);

  const userExist = users.find((user, i) => {
    if (user.id === input.id && roleExist) {
      const userRoleExist = user.roles.find((role) => {
        if (role.role === roleExist.role) {
          return role;
        }
      });
      !userRoleExist ? users[i].roles.push(roleExist) : '';
      return user;
    }
  });

  return userExist;
};

const auth = async (req) => {
  //? Maybe it's not necessary if here, it's just return the functions
  //? that don't need authorization
  if (
    req.body.operationName === 'Authorize' ||
    req.body.operationName === 'CreateAccount' ||
    req.body.operationName === 'IntrospectionQuery'
  ) {
    return {
      createUser,
      authLogin,
    };
  }
  const token = req.headers.authorization;

  if (!token) {
    throw new AuthorizationError('Não tem autorização.');
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
          createUser,
          findAllUsers,
          findAllRoles,
          findCurrentUser,
          createNewRole,
          authLogin,
          addRoleUser,
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
