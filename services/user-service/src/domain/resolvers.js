const jwt = require('jsonwebtoken');

const users = [
  {
    id: '1',
    email: 'piparo@example.com',
    password: 'pass123',
    roles: ['admin', 'manager'],
    idCostumer: 'Cust1',
    created: '2022-01-01T10:00:00Z',
  },
  {
    id: '2',
    email: 'andre@example.com',
    password: 'pass456',
    roles: ['manager', 'intern'],
    idCostumer: 'Cust2',
    created: '2022-02-15T14:30:00Z',
  },
  {
    id: '3',
    email: 'claudia@example.com',
    password: 'pass789',
    roles: ['admin'],
    idCostumer: 'Cust3',
    created: '2022-03-21T09:45:00Z',
  },
  {
    id: '4',
    email: 'soraia@example.com',
    password: 'passabc',
    roles: ['intern'],
    idCostumer: 'Cust4',
    created: '2022-04-02T18:20:00Z',
  },
];

const resolvers = {
  Query: {
    me: (_, __, { currentUser }) => currentUser,
    accounts: (_, __, { currentUser }) => {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      return users;
    },
  },
  Mutation: {
    createAccount(_, { input }) {
      input.id = Math.floor(Math.random() * 1000);
      input.created = new Date().toISOString();
      users.push(input);
      const user = users[users.length - 1];
      const token = jwt.sign({ email: user.email }, 'icarusteam');
      return {
        token,
        user,
      };
    },
    authorize(_, { email, password }) {
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
      const token = jwt.sign({ email: user.email }, 'icarusteam');
      return {
        token,
        user,
      };
    },
  },
};

module.exports = { resolvers, users };
