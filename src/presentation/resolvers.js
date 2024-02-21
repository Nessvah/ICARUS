import fs from 'fs';
import { controller } from '../infrastructure/db/connector.js';
import { validation } from '../utils/validation/validation.js';
//import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

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
    let nestedObject = {};

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

    // To create the relations based on the column key "isObject"
    table.columns.forEach((column) => {
      if (column.isObject) {
        createRelations(table, column, nestedObject);
      }
    });
  });
}

const createRelations = async (table, column, nestedObject) => {
  const name = column.type === 'int' ? column.foreignEntity : column.name;
  // Naming child relations with entity name
  //const name = column.foreignEntity;
  const { foreignKey } = column;

  // Creating the field for each parent inside nestedObject (ie: "Customer")
  nestedObject[name] = async (parent) => {
    const argss = { input: { action: 'find', filter: { [foreignKey]: parent[foreignKey] } } };

    // Calling the query to solve the parent field with the
    // name of the table and the argss with foreignKey
    const entity = await controller(column.foreignEntity, argss);
    let res = entity.filter((entit) => {
      if (entit[column.foreignKey] === parent[column.foreignKey]) {
        return entit;
      }
    });
    // If the relation is "1xn", return the entire array with the objects [{}, {}...]
    // else "nx1" or "1x1", return just the first object inside the array
    if (column.relationType[2] === 'n') {
      return res;
    } else {
      return res[0];
    }
  };

  let tableName = capitalize(table.name);
  preResolvers[tableName] = nestedObject;
};
autoResolvers();

const resolvers = preResolvers;

export { resolvers, autoResolvers };
