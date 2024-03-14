import { controller } from '../infrastructure/db/connector.js';
import { validation } from '../utils/validation/validation.js';
//import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';
import { config } from './generateTypeDefs.js';
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

    resolvers.Query[table.name] = async (parent, args, context, info) => {
      return await controller(table.name, args);
    };

    resolvers.Query[countName] = async (parent, args, context, info) => {
      const result = await controller(table.name, args);

      return { count: result };
    };

    resolvers.Mutation[table.name] = async (parent, args, context, info) => {
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
/**
 **  Create the subQueries based on the column key "isObject".
 * @param {string} table - name of the table
 * @param {object} column - information about the column
 */
const createRelations = async (table, column) => {
  const name = column.isObject ? column.foreignEntity : column.name;
  //create a object with the subQueries.
  nestedObject[name] = async (parent, args) => {
    let tempArgs = args;
    // for mongodb searching parents
    if (table.database.type === 'mongodb') {
      //const idValue = ObjectId.isValid(parent[column.name]) ? parent[column.name].toString() : parent[column.name];
      args = {
        input: {
          filter: { _and: { [column.foreignKey]: { _eq: parent.id } } },
        },
      };
      // for MySQL searching parents
    } else {
      args = {
        input: { filter: { [column.foreignKey]: parent[column.foreignKey] } },
      };
    }
    //add the take and skip to the args that will be sended to the controllers.
    tempArgs.take ? (args.input.take = tempArgs.take) : '';
    tempArgs.skip ? (args.input.skip = tempArgs.skip) : '';

    const relatedObjects = await controller(column.foreignEntity, args);

    // return a array or a single object depending on the relation.
    return column.relationType[2] === 'n' ? relatedObjects : relatedObjects[0];
  };

  const tableName = capitalize(table.name);
  //add the subQueries to the resolvers.
  resolvers[tableName] = nestedObject;
};

export { autoResolvers };
