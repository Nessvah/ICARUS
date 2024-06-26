import { controller } from '../infrastructure/db/connector.js';
import { logger } from '../infrastructure/server.js';
//import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';
import { getGraphQLRateLimiter } from 'graphql-rate-limit';
import { ImportThemTities } from '../config/importDemTities.js';
import { beforeResolverRelations, hookExecutor } from '../utils/hooks/beforeResolver/hookExecutor.js';
import { AuthorizationError } from '../utils/error-handling/CustomErrors.js';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { validation } from '../utils/validation/validation.js';

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
  resolvers.Upload = GraphQLUpload;

  resolvers.Mutation = {
    authorize: (_, { input }, { authLogin }) => authLogin(input),
  };

  data.tables.forEach((table) => {
    const countName = `${table.name}Count`;

    resolvers.Query[table.name] = async (parent, incomeArgs, incomeContext, info) => {
      try {
        // Calling function hookExecutor to see if there is hooks beforeResolver
        const { argss, context } = await hookExecutor(table, 'query', 'beforeResolver', {
          argss: incomeArgs,
          context: incomeContext,
        });

        //verify if the user it's exceeding the rate limit calls for seconds.
        const limitErrorMessage = await rateLimiter({ parent, argss, context, info }, rateLimiterConfig);
        if (limitErrorMessage) throw new Error(limitErrorMessage);

        // Calling function hookExecutor to see if there is hooks beforeQuery
        const { args, newContext } = await hookExecutor(table, 'query', 'beforeQuery', {
          args: argss,
          newContext: context,
        });
        // Making query
        let res = await controller(table.name, args);

        // Calling function hookExecutor to see if there is hooks afterQuery
        const { res: changedRes } = await hookExecutor(table, 'query', 'afterQuery', {
          args,
          argss,
          res,
          context: newContext,
          incomeContext,
        });

        // Sending modified result
        return changedRes;
      } catch (e) {
        logger.error(e);
        throw new AuthorizationError(e);
      }
    };

    resolvers.Query[countName] = async (parent, incomeArgs, incomeContext, info) => {
      // Calling function hookExecutor to see if there is hooks beforeResolver
      const { argss, context } = await hookExecutor(table, 'count', 'beforeResolver', {
        argss: incomeArgs,
        context: incomeContext,
      });

      // Calling function hookExecutor to see if there is hooks beforeQuery
      const { args, newContext } = await hookExecutor(table, 'count', 'beforeQuery', {
        args: argss,
        newContext: context,
      });

      // Making query
      let res = await controller(table.name, args);

      // Calling function hookExecutor to see if there is hooks afterQuery
      const { res: changedRes } = await hookExecutor(table, 'count', 'afterQuery', {
        args,
        argss,
        res,
        context: newContext,
        incomeContext,
      });

      // Sending modified result
      return { count: changedRes };
    };

    resolvers.Mutation[table.name] = async (parent, incomeArgs, incomeContext, info) => {
      try {
        // Extracting the operation which is being made "_update, _create or _delete"
        const { input } = incomeArgs;
        const operationName = Object.keys(input)[0];

        // Calling function hookExecutor to see if there is hooks beforeResolver
        const { argss, context } = await hookExecutor(table, operationName, 'beforeResolver', {
          argss: incomeArgs,
          context: incomeContext,
        });

        //verify if the user it's exceeding the rate limit calls for seconds.
        const limitErrorMessage = await rateLimiter({ parent, argss, context, info }, rateLimiterConfig);
        if (limitErrorMessage) throw new Error(limitErrorMessage);

        await validation(argss.input); // it validates mutation inputs
        await validation(argss.input, '_update'); // it validates update inputs;

        // Calling function hookExecutor to see if there is hooks beforeQuery
        const { args, newContext } = await hookExecutor(table, operationName, 'beforeQuery', {
          args: argss,
          newContext: context,
        });

        // Making query
        let res = await controller(table.name, args, table);

        // Calling function hookExecutor to see if there is hooks afterQuery
        const { res: changedRes } = await hookExecutor(table, operationName, 'afterQuery', {
          args,
          argss,
          res,
          context: newContext,
          incomeContext,
        });

        // Sending modified result
        return changedRes;
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
    // Verification of connection type to change any problem into args
    const argss = await beforeResolverRelations(table, args, column, parent);
    // Calling the controller to make the query
    const relatedObjects = await controller(column.foreignEntity, argss);

    // Sending the response in an array format "n" or only the firts object "1"
    return column.relationType[2] === 'n' ? relatedObjects : relatedObjects[0];
  };

  const tableName = capitalize(table.name);
  resolvers[tableName] = nestedObject;
};
