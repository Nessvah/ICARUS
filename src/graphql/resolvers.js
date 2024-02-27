import fs from 'fs';
import { controller } from '../infrastructure/db/connector.js';

//import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';

let data = JSON.parse(fs.readFileSync(`../src/config.json`, 'utf8'));

//a pre version of the resolvers, with same static Query and Mutation.
export const resolvers = {
  Query: {
    tables: () => {
      let tablesInfo = data.tables.map((table) => {
        return { table: table.name, structure: JSON.stringify(table.columns) };
      });
      return tablesInfo;
    },
  },
  Mutation: {
    authorize: (_, { input }, { authLogin }) => authLogin(input),
  },
};

// this function use the "data" parameter and create the resolvers dynamically.
async function autoResolvers() {
  data.tables.forEach((table) => {
    const countName = `${table.name}Count`;

    resolvers.Query[table.name] = async (parent, args, context, info) => {
      // if (!context.currentUser) {
      //   throw new AuthenticationError();
      // }

      const results = await controller(table.name, args);
      return results;
    };

    resolvers.Query[countName] = async (parent, args, context, info) => {
      // if (!context.currentUser) {
      //   throw new AuthenticationError();
      // }

      const result = await controller(table.name, args);

      return { count: result };
    };

    resolvers.Mutation[table.name] = async (parent, args, context, info) => {
      // if (!context.currentUser) {
      //   throw new AuthenticationError();
      // }
      return await controller(table.name, args);
    };
  });
}

await autoResolvers();
