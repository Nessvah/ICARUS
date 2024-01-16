import jwt from 'jsonwebtoken';

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
];

const roles = [
  { id: '1', role: 'admin' },
  { id: '2', role: 'manager' },
  { id: '3', role: 'intern' },
];

const createUser = (input) => {
  input.id = Math.floor(Math.random() * 1000);
  input.created = new Date().toISOString();
  users.push(input);
  const user = users[users.length - 1];
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
  return {
    token,
    user,
  };
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

const authLogin = (email, password) => {
  const user = users.find((user) => {
    if (user.email === email) {
      return user;
    }
    return false;
  });
  if (!user) {
    throw new Error(`account for ${email} not found`);
  }
  if (user.password !== password) {
    throw new Error(`password for ${email} is incorrect`);
  }
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
  return {
    token,
    user,
  };
};

const createNewRole = ({ role }) => {
  const newRole = { id: Math.floor(Math.random() * 10000).toString(), role };
  roles.push(newRole);
  return newRole;
};

const auth = (req) => {
  let currentUser = null;
  if (req.headers.authorization) {
    try {
      const { email } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
      currentUser = users.find((user) => {
        if (user.email === email) {
          return user;
        }
        return false;
      });
    } catch (error) {
      throw new Error(`invalid authorization token`);
    }
  }
  return {
    currentUser,
    createUser,
    findAllUsers,
    findAllRoles,
    findCurrentUser,
    createNewRole,
    authLogin,
  };
};

export { auth };
