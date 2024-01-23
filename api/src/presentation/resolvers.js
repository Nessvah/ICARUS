import { getProducts } from '../app/productsUseCase.js';

const resolvers = {
  Query: {
    me: (_, __, { currentUser, findCurrentUser }) => findCurrentUser(currentUser),
    accounts: (_, __, { findAllUsers }) => findAllUsers(),
    roles: (_, __, { findAllRoles }) => findAllRoles(),
    products: async (_, __, { currentUser }) => await getProducts(currentUser),
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
    addRoleToUSer(_, { input }, { addRoleUser }) {
      return addRoleUser(input);
    },
  },
};

export { resolvers };
