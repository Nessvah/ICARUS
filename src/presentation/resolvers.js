import fs from 'fs';
import { controller } from '../infrastructure/db/connector.js';
import { validation } from '../utils/validation/validation.js';
//import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';

let data = JSON.parse(fs.readFileSync(`../src/config.json`, 'utf8'));

//a pre version of the resolvers, with same static Query and Mutation.
const preResolvers = {
  Query: {
    tables: (parents, args, context, info) => {
      let tablesInfo = data.tables.map((table) => {
        return { table: table.name, structure: JSON.stringify(table.columns) };
      });
      return tablesInfo;
    },
  },
  Mutation: {
    authorize: (parents, { input }, { authLogin }, info) => authLogin(input),
  },
};

// this function use the "data" parameter and create the resolvers dynamically.
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
      await validation(args.input); // it validates mutation inputs
      await validation(args.input, 'update'); // it validates update inputs;
      return await controller(table.name, args);
    };
  });
}

autoResolvers();

const resolvers = preResolvers;

export { resolvers, autoResolvers };
