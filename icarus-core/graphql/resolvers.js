import { controller } from '../infrastructure/db/connector.js';
import { validation } from '../utils/validation/validation.js';
//import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';
import { config } from './generateTypeDefs.js';
import { hookExecutor, beforeResolverRelations } from '../utils/hooks/beforeResolver/hookExecutor.js';
import { AuthorizationError } from '../utils/error-handling/CustomErrors.js';
import { logger } from '../infrastructure/server.js';

// capitalize the first letter of a string.
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

let nestedObject = {};
export const resolvers = {};

/**
 ** This function use the "data" parameter and create the resolvers dynamically.
 * @param {object} data - is a object with the tables configurations to create the resolvers dynamically.
 */
async function autoResolvers() {
  const data = config;
  // add query to the resolvers
  resolvers.Query = {
    //tables its use to send the names e structures off all the tables to the frontend.
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
  // add mutation to the resolvers.
  resolvers.Mutation = {};

  /**
   ** Add query's and mutations to the resolvers.
   * @param {string} table - name of the table.
   * @param {object} args - args have all the information passed to the query or mutation, and define the action that will be made in the controllers.
   */
  data.tables.forEach((table) => {
    const countName = `${table.name}Count`;

    resolvers.Query[table.name] = async (parent, incomeArgs, incomeContext, info) => {
      try {
        // Calling function hookExecutor to see if there is hooks beforeResolver
        const { argss, context } = await hookExecutor(table, 'query', 'beforeResolver', {
          argss: incomeArgs,
          context: incomeContext,
        });

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
/**
 **  Create the subQueries based on the column key "isObject".
 * @param {string} table - name of the table
 * @param {object} column - information about the column
 */
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
export { autoResolvers };
