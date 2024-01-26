import jwt from 'jsonwebtoken';
import { getProducts } from '../../app/productsUseCase.js';
import { initiateAuth } from './authCognito.js';
import { getUser } from './getUserCognito.js';
import { signUp } from './signUpCognito.js';
import { addUserToAGroup } from './addUserToAGroup.js';
import { listAllGroups } from './getAllRolesCognito.js';
import winston from 'winston';
import { getUserRoles } from './getUserRoles.js';
import { listAllUsers } from './getAllUsers.js';
import { getRolesPerUser } from './getUsersPerGroupCognito.js';

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
    // Sending signUp request to Cognito with user inputs (email, password)
    const responseStatusCode = await signUp(input);
    logger.info(`User createad successfully! Status code: ${responseStatusCode}`);
    // If user sign up is successfully, createdUser receives input.email
    const createdUser = input.email;
    return {
      createdUser,
    };
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
    const allUsersResponse = await listAllUsers();
    if (allUsersResponse.$metadata.httpStatusCode === 200) {
      const allUsers = await Promise.all(
        allUsersResponse.Users.map(async (user) => {
          const created = user.UserCreateDate;
          const emailAttribute = user.Attributes.find((Attribute) => Attribute.Name === 'email');
          const emailValue = emailAttribute ? emailAttribute.Value : null;
          const idAttribute = user.Attributes.find((Attribute) => Attribute.Name === 'custom:customer_id');
          const idValue = idAttribute ? idAttribute.Value : null;
          const rolesPerUser = await getRolesPerUser(emailValue);

          return {
            id: idValue,
            created: created,
            email: emailValue,
            roles: rolesPerUser,
            idCustomer: '1',
          };
        }),
      );
      return allUsers;
    }
    return;
  } catch (e) {
    logger.error('An error has occurred: ', e);
    throw e;
  }
};

const findAllRoles = () => {
  return;
};

const findCurrentUser = (currentUser) => {
  return currentUser;
};

const authLogin = async (email, password) => {
  try {
    // Calling cognito authentication function with inputs
    const response = await initiateAuth({ email, password });

    // Confirming if the response of the request was successfully
    if (response.$metadata.httpStatusCode === 200) {
      return {
        token: response.AuthenticationResult.IdToken,
        user: { email: email },
      };
    } else {
      return new Error('Server error');
    }
  } catch (e) {
    logger.error('An error occurred during authentication:', e.message);
    throw e; // Rethrow the error to propagate it up the call stack
  }
};

const createNewRole = ({ role }) => {
  const newRole = { id: Math.floor(Math.random() * 10000).toString(), role };
  //roles.push(newRole);
  return newRole;
};

const addRoleUser = async (input) => {
  //const roleExist = roles.find((role) => role.role === input.role);
  const { email, role } = input;
  try {
    // Getting all roles (groups) and all user roles responses from cognito
    const rolesResponse = await listAllGroups();
    const userRolesResponse = await getUserRoles(email);
    if (!rolesResponse || !userRolesResponse) {
      return new Error('Unexpected error has ocurred');
    } else {
      // Creating an array of the roles in cognito response to compare if the input role
      // is one of the roles
      const cognitoRoles = rolesResponse.Groups.map((group) => group.GroupName);
      // Verifying if the inserted role is equal a cognito role
      const verifyingInsertedRole = cognitoRoles.find((cognitoRole) => cognitoRole === role);
      // Verifying if user roles comprehend the input role
      const verifyingUserRoles = userRolesResponse.Groups.find((group) => group.GroupName === role);
      if (verifyingUserRoles) {
        return new Error(`User is has already ${role} permissions`);
        //Verifying if the inserted role exists in cognito
      } else if (!verifyingInsertedRole) {
        return new Error(`Role ${role} inserted does not exist, try again`);
      } else {
        const addRoleToAUser = await addUserToAGroup(email, role);
        logger.info('Role inserted successfully: ', addRoleToAUser);
        return addRoleToAUser;
      }
    }
  } catch (e) {
    return new Error(`Unexpected error has ocurred, check email: ${email} and role: ${role} inserted`);
  }
};

const auth = async (req) => {
  if (req.headers.authorization) {
    try {
      // Decoding jwt to get the email inside the token
      // inserted in autohorization field
      const { email } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
      // Calling getUserCognito function to compare the email
      // inside the token with a Cognito user email
      const loginStatus = await getUser(email);
      // Based on Cognito response, if it's 200, the user is able to
      // query, otherwise send an error
      if (loginStatus.$metadata.httpStatusCode !== 200) {
        logger.error(`invalid authorization token`);
      } else {
        const currentUser = email;
        return {
          currentUser,
          getProducts,
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
    if (req.body.operationName === 'Authorize' || req.body.operationName === 'CreateAccount') {
      return {
        createUser,
        authLogin,
      };
    }
  }
};

export { auth };
