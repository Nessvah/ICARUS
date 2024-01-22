import jwt from 'jsonwebtoken';
import { getProducts } from '../../app/productsUseCase.js';
import { initiateAuth } from './authCognito.js';
import { getUser } from './getUserCognito.js';
import { signUp } from './signUpCognito.js';
import winston from 'winston';

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

const createUser = async (input) => {
  try {
    const createdUser = await signUp(input);
    return {
      createdUser,
    };
  } catch (e) {
    logger.error('Error creating user ', e);
  }
  //? This is not necessary
  // The user will only get a token if after creating he's account,
  // after verifying their email user for the registration, and
  // if he can get a successfull sign in
  //const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
  return;
};

const findAllUsers = (currentUser) => {
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  return users;
};

const findAllRoles = (currentUser) => {
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  return roles;
};

const findCurrentUser = (currentUser) => {
  if (!currentUser) {
    throw new Error('Invalid authorization');
  }
  return currentUser;
};

const authLogin = async (email, password) => {
  let token = '';
  try {
    // Call the initiateAuth function with the provided username and password
    const response = await initiateAuth({ email, password });
    token = response.AuthenticationResult.IdToken; // Log the response if authentication is successful
  } catch (e) {
    logger.error('Error:', e); // Log any unhandled exceptions
  }
  return {
    token,
    user: {
      email: 'maldonado.pe@hotmail.com',
    },
  };
};

const createNewRole = ({ role }) => {
  const newRole = { id: Math.floor(Math.random() * 10000).toString(), role };
  roles.push(newRole);
  return newRole;
};

const auth = async (req) => {
  let currentUser = null;
  if (req.headers.authorization) {
    try {
      const { email } = jwt.decode(req.headers.authorization);
      currentUser = await getUser(email);
      if (currentUser === email) {
        return currentUser;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error(`invalid authorization token`);
    }
  }
  return {
    currentUser,
    getProducts,
    createUser,
    findAllUsers,
    findAllRoles,
    findCurrentUser,
    createNewRole,
    authLogin,
  };
};

export { auth };
