const resolvers = {
  Query: {
    me: (_, __, { currentUser, findCurrentUser }) => findCurrentUser(currentUser),
    accounts: (_, __, { currentUser, findAllUsers }) => findAllUsers(currentUser),
    roles: (_, __, { currentUser, findAllRoles }) => findAllRoles(currentUser),
  },
  Mutation: {
    createAccount(_, { input }, { createUser }) {
      return createUser(input);
    },
    authorize(_, { email, password }, { authLogin }) {
      return authLogin(email, password);
    },
    createRole(_, { input }, { createNewRole }) {
      return createNewRole(input);
    },
  },
};

export { resolvers };
