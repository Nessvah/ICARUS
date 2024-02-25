import fs from 'fs';
import { controller } from '../infrastructure/db/connector.js';
import { validation } from '../utils/validation/validation.js';
import { ObjectId } from 'mongodb';
//import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

let data = JSON.parse(fs.readFileSync(`../src/config.json`, 'utf8'));
let nestedObject = {};
//a pre version of the resolvers, with same static Query and Mutation.
const preResolvers = {
  Query: {
    tables: (parents, args, context, info) => {
      let tablesInfo = data.tables.map((table) => {
        const columns = table.columns.map((column) => column);
        console.log({ table: table.name, structure: JSON.stringify(columns) });
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
      console.log('query started');
      return await controller(table.name, args);
    };

    preResolvers.Mutation[table.name] = async (parent, args, context, info) => {
      // if (!context.currentUser) {
      //   throw new AuthenticationError();
      // }
      await validation(args.input); // it validates mutation inputs
      await validation(args.input, 'update'); // it validates update inputs;
      console.log('mutation started');
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
      const idValue = ObjectId.isValid(parent[column.name]) ? parent[column.name].toString() : parent[column.name];
      args = { input: { action: 'find', filter: { [column.foreignKey]: [idValue] } } };
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

autoResolvers();

const resolvers = preResolvers;

export { resolvers, autoResolvers };
