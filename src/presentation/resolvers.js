// import { getSecrets } from '../aws/auth/Cognito/userValidation/secretsManager.js';
// import { SECRETS } from '../utils/enums/enums.js';
// import { isAutenticated } from '../infrastructure/auth/AuthResolver.js';
// import { logger } from '../infrastructure/server.js';
// import { allProducts, productById, productByName, productsByPrice } from '../models/productModel.js';
// import { allCustomers, customerById } from '../models/customersModel.js';
import fs from 'fs';
import { controller } from '../infrastructure/db/connector.js';
import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';

let data = JSON.parse(fs.readFileSync(`../src/config.json`, 'utf8'));

const preResolvers = {
  Query: {},
  Mutation: {
    authorize: (parents, { input }, { authLogin }, info) => authLogin(input),
  },
};

async function autoResolvers() {
  data.tables.forEach((table) => {
    preResolvers.Query[table.name] = async (parent, args, context, info) => {
      // if (!context.currentUser) {
      //   throw new AuthenticationError();
      // }
      return await controller(table.name, args);
    };

    preResolvers.Mutation[table.name] = async (parent, args, context, info) => {
      // if (!context.currentUser) {
      //   throw new AuthenticationError();
      // }
      return await controller(table.name, args);
    };
  });
}

autoResolvers();

const resolvers = preResolvers;

export { resolvers, autoResolvers };
