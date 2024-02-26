import fs from 'fs';
import { controller } from '../infrastructure/db/connector.js';
import { validation } from '../utils/validation/validation.js';
import { ObjectId } from 'mongodb';
//import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';
import { ImportThemTities } from '../config/importDemTities.js';
import { logger } from '../infrastructure/server.js';

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
    tables: (parents, args, context, info) => {
      let tablesInfo = data.tables.map((table) => {
        const columns = table.columns.map((column) => column);
        // console.log({ table: table.name, structure: JSON.stringify(columns) });
        return { table: table.name, structure: JSON.stringify(columns) };
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
      args = { input: { action: 'find', filter: { [column.foreignKey]: [parent[column.name]] } } };
      // for MySQL searching parents
    } else {
      args = { input: { action: 'find', filter: { [column.foreignKey]: [parent[column.foreignKey]] } } };
    }
    const relatedObjects = await controller(column.foreignEntity, args);

    return column.relationType[2] === 'n' ? relatedObjects : relatedObjects[0];
  };

  let tableName = capitalize(table.name);
  preResolvers[tableName] = nestedObject;
};

const resolvers = preResolvers;

export { resolvers, autoResolvers };
