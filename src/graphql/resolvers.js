import { controller } from '../infrastructure/db/connector.js';
import { logger } from '../infrastructure/server.js';
import { validation } from '../utils/validation/validation.js';
//import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';
import { getGraphQLRateLimiter } from 'graphql-rate-limit';
import { ImportThemTities } from '../config/importDemTities.js';
import { beforeResolver } from '../utils/hooks/beforeResolver.js';
import { AuthorizationError } from '../utils/error-handling/CustomErrors.js';

// We initialize a rate limiter instance by calling getGraphQLRateLimiter.
// This function takes an object as an argument with a property identifyContext that defines
// how to identify the context for rate limiting purposes.
// In this case, the context is identified based on the id property of the context object

const rateLimiter = getGraphQLRateLimiter({
  identifyContext: (ctx) => ctx.currentUser,
});

const rateLimiterConfig = { max: 10, window: '1s' };

const importer = new ImportThemTities();

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

(async () => {
  try {
    const data = await importer.importAll();
    if (data && data.tables) {
      // Ensure data.tables is defined
      //console.log('data:', data, '______________'); // Log the retrieved data

      // Call autoResolvers after data is available
      await autoResolvers(data);

      return data;
    } else {
      logger.error('Data is missing or incomplete.');
    }
    return null;
  } catch (error) {
    logger.error('Error reading file:', error);
  }
})();

let nestedObject = {};
export const resolvers = {};

// this function use the "data" parameter and create the resolvers dynamically.
async function autoResolvers(data) {
  resolvers.Query = {
    tables: () => {
      const tablesInfo = data.tables.map((table) => {
        const columns = table.columns.map((column) => column);
        return {
          table: table.name,
          structure: JSON.stringify(columns),
          backoffice: JSON.stringify(table.backoffice), // Add tables.backoffice
        };
      });
      return tablesInfo;
    },
  };

  resolvers.Mutation = {
    authorize: (_, { input }, { authLogin }) => authLogin(input),
  };

  data.tables.forEach((table) => {
    const countName = `${table.name}Count`;

    resolvers.Query[table.name] = async (parent, args, context, info) => {
      try {
        // Caling function beforeResolver to see if there is hooks for the query called
        await beforeResolver(table.name, args, 'Query');

        //console.log(table);
        //verify if the user it's exceeding the rate limit calls for seconds.
        const limitErrorMessage = await rateLimiter({ parent, args, context, info }, rateLimiterConfig);

        if (limitErrorMessage) throw new Error(limitErrorMessage);
        return await controller(table.name, args);
      } catch (e) {
        logger.error(e);
        throw new AuthorizationError(e);
      }
    };

    resolvers.Query[countName] = async (parent, args, context, info) => {
      //const res = await myHook(table, input);
      const result = await controller(table.name, args);

      return { count: result };
    };

    resolvers.Mutation[table.name] = async (parent, args, context, info) => {
      try {
        const res = await beforeResolver(table.name, args, 'Mutation');
        //verify if the user it's exceeding the rate limit calls for seconds.
        const limitErrorMessage = await rateLimiter({ parent, args, context, info }, rateLimiterConfig);
        if (limitErrorMessage) throw new Error(limitErrorMessage);

        // if (!context.currentUser) {
        //   throw new AuthenticationError();
        // }
        await validation(args.input); // it validates mutation inputs
        await validation(args.input, 'update'); // it validates update inputs;

        return await controller(table.name, args);
      } catch (e) {
        throw new AuthorizationError(e);
      }
    };

    nestedObject = {};

    // To create the relations based on the column key "isObject"
    table.columns.forEach((column) => {
      if (column.isObject) {
        createRelations(table, column);
      }
    });
  });
}

const createRelations = async (table, column) => {
  const name = column.isObject ? column.foreignEntity : column.name;
  nestedObject[name] = async (parent, args) => {
    let tempArgs = args;
    // for mongodb searching parents
    if (table.database.type === 'mongodb') {
      //const idValue = ObjectId.isValid(parent[column.name]) ? parent[column.name].toString() : parent[column.name];
      args = { input: { filter: { _and: { [column.foreignKey]: { _eq: parent.id } } } } };
      // for MySQL searching parents
    } else {
      args = { input: { filter: { [column.foreignKey]: parent[column.foreignKey] } } };
    }

    tempArgs.take ? (args.input.take = tempArgs.take) : '';
    tempArgs.skip ? (args.input.skip = tempArgs.skip) : '';

    const relatedObjects = await controller(column.foreignEntity, args);

    return column.relationType[2] === 'n' ? relatedObjects : relatedObjects[0];
  };

  const tableName = capitalize(table.name);
  resolvers[tableName] = nestedObject;
};
