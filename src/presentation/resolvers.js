import { controller } from '../infrastructure/db/connector.js';
import { logger } from '../infrastructure/server.js';
import { validation } from '../utils/validation/validation.js';

//import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';
import { getGraphQLRateLimiter } from 'graphql-rate-limit';
import { ImportThemTities } from '../config/importDemTities.js';

//We initialize a rate limiter instance by calling getGraphQLRateLimiter.
//This function takes an object as an argument with a property identifyContext that defines how to identify the context for rate limiting purposes.
//In this case, the context is identified based on the id property of the context object
const rateLimiter = getGraphQLRateLimiter({
  identifyContext: (ctx) => ctx.currentUser,
});

const importer = new ImportThemTities();

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

let data;
(async () => {
  try {
    data = await importer.importAll();
    if (data && data.tables) {
      // Ensure data.tables is defined
      //console.log('data:', data, '______________'); // Log the retrieved data

      // Call autoResolvers after data is available
      await autoResolvers();

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
//a pre version of the resolvers, with same static Query and Mutation.
const preResolvers = {
  Query: {
    tables: () => {
      let tablesInfo = data.tables.map((table) => {
        const columns = table.columns.map((column) => column);
        return {
          table: table.name,
          structure: JSON.stringify(columns),
          backoffice: JSON.stringify(table.backoffice), // Add tables.backoffice
        };
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

    preResolvers.Query[table.name] = async (parent, args, context, info) => {
      //verify if the user it's exceeding the rate limit calls for seconds.
      const limitErrorMessage = await rateLimiter({ parent, args, context, info }, { max: 10, window: '1s' });

      if (limitErrorMessage) throw new Error(limitErrorMessage);
      // if (!context.currentUser) {
      //   throw new AuthenticationError();
      // }

      return await controller(table.name, args);
    };

    resolvers.Query[countName] = async (parent, args, context, info) => {
      // if (!context.currentUser) {
      //   throw new AuthenticationError();
      // }

      const result = await controller(table.name, args);

      return { count: result };
    };

    preResolvers.Mutation[table.name] = async (parent, args, context, info) => {
      //verify if the user it's exceeding the rate limit calls for seconds.
      const limitErrorMessage = await rateLimiter({ parent, args, context, info }, { max: 10, window: '1s' });
      if (limitErrorMessage) throw new Error(limitErrorMessage);
      // if (!context.currentUser) {
      //   throw new AuthenticationError();
      // }
      await validation(args.input); // it validates mutation inputs
      await validation(args.input, 'update'); // it validates update inputs;

      return await controller(table.name, args);
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
  nestedObject[name] = async (parent) => {
    let args;
    // for mongodb searching parents
    if (table.database.type === 'mongodb') {
      //const idValue = ObjectId.isValid(parent[column.name]) ? parent[column.name].toString() : parent[column.name];
      args = { input: { action: 'FIND', filter: { _and: { [column.foreignKey]: { _eq: [parent[column.name]] } } } } };
      // for MySQL searching parents
    } else {
      args = { input: { action: 'FIND', filter: { [column.foreignKey]: [parent[column.foreignKey]] } } };
    }
    const relatedObjects = await controller(column.foreignEntity, args);

    return column.relationType[2] === 'n' ? relatedObjects : relatedObjects[0];
  };

  let tableName = capitalize(table.name);
  preResolvers[tableName] = nestedObject;
};

const resolvers = preResolvers;

export { autoResolvers, resolvers };
