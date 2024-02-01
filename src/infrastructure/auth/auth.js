import jwt from 'jsonwebtoken';
import { getAllUsers, getUser, initiateAuth, signUp } from './Cognito/index.js';
import winston from 'winston';
import { isValidPassword } from './Cognito/userValidation/passwordValidation.js';
import { isValidEmail } from './Cognito/userValidation/emailValidation.js';
import { decryptingPassword } from './Cognito/userValidation/decrypt.js';
import { tokenVerifier } from './Cognito/userValidation/jwtVerifier.js';
import crypto from 'crypto';

const users = [
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

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

const createUser = async (input) => {
  try {
    //* I'm incrypting the information which comes from frontend here to test
    //* but the encryptation is made on frontend
    /* const publicKey = process.env.publicKeyFrontend;
    const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(input.password)); */

    // Decrypting password which came from frontend
    const decryptedData = decryptingPassword(input);

    // Verifying password and email from frontend to see if they are standardized
    const verifyUserPassword = isValidPassword(decryptedData);
    const verifygUserEmail = isValidEmail(decryptedData.email);

    // If they are, it's time to call cognito function to add them
    if (verifyUserPassword && verifygUserEmail) {
      // Sending signUp request to Cognito with user inputs (email, password)
      const responseStatusCode = await signUp(decryptedData);
      logger.info(`User createad successfully! Status code: ${responseStatusCode}`);
      // If user sign up is successfully, createdUser receives input.email
      const userResponse = await getUser(input.email);
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
  //? This is not necessary
  // The user will only get a token if after creating he's account,
  // after verifying their email user for the registration, and
  // if he can get a successfull sign in
  //const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
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
      const roleAttribute = user.Attributes.find((Attribute) => Attribute.Name === 'custom:role');
      const roleValue = roleAttribute ? roleAttribute.Value : null;
      return {
        email: emailValue,
        role: roleValue,
        created,
      };
    });
    return {
      users,
    };
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
    console.log('estou aqui');
    console.log(input);
    //* I'm incrypting the information which comes from frontend here to test
    //* but the encryptation is made on frontend
    const publicKey = process.env.publicKeyFrontend;
    const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(input.password));

    // Decrypting password which came from frontend
    const decryptedData = decryptingPassword(encryptedData, input);

    // Verifying password and email from frontend to see if they are standardized
    const verifyUserPassword = isValidPassword(decryptedData);
    const verifygUserEmail = isValidEmail(decryptedData.email);
    // If they are, it's time to call cognito function to initiate
    // cognito authentication function with inputs
    if (verifyUserPassword && verifygUserEmail) {
      const { email, password } = decryptedData;
      const response = await initiateAuth({ email, password });

      const token = JSON.stringify({
        IdToken: response.AuthenticationResult.IdToken,
        AccessToken: response.AuthenticationResult.AccessToken,
        RefreshToken: response.AuthenticationResult.RefreshToken,
      });
      // Confirming if the response of the request was successfully
      if (response.$metadata.httpStatusCode === 200) {
        return {
          token: token,
          user: decryptedData,
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
  const token = req.headers.authorization;
  if (token) {
    const parsedToken = JSON.parse(token);
    const parsedToken2 = JSON.parse(parsedToken);
    try {
      // Verifying AWS jwt to see if it is correct
      const jwtResponse = await tokenVerifier(parsedToken2.AccessToken);
      // inserted in autohorization field
      if (jwtResponse) {
        const { email } = jwt.decode(parsedToken2.IdToken);
        // Calling getUserCognito function to compare the email
        // inside the token with a Cognito user email
        const currentUser = email;
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
      }
    } catch (error) {
      logger.error(`invalid authorization token`);
    }
  } else {
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
  }
};

export { auth };
