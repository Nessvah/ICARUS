import { getProducts } from '../app/productsUseCase.js';

const resolvers = {
  Query: {
    me: (_, __, { currentUser, findCurrentUser }) => findCurrentUser(currentUser),
    accounts: (_, __, { currentUser, findAllUsers }) => findAllUsers(currentUser),
    roles: (_, __, { currentUser, findAllRoles }) => findAllRoles(currentUser),

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

    // testing workflow
    //! This was throwing an error because it didn't matched schemas
    // addRoleToUSer(_, { input }, { addRoleUser }) {
    //   return addRoleUser(input);
    // },
  },
};

export { resolvers };
