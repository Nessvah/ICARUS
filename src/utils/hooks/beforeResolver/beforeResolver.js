import fs from 'fs';
import { permissionHook } from './permissionHook.js';
import { beforeResolverMutation } from './beforeResolverMutation.js';

/**
 * Constructor for MongoDBConnection class.
 * @param {string} table - Name of current table.
 * @param {object} args - Args with input information.
 * @param {string} QueryType - Query type (Mutation/Query).
 * @returns {Promise<object[]>} - Modified args or same args.
 */
const beforeResolver = async (table, args, QueryType) => {
  try {
    // Definition of entity path
    const filePath = `config/entities/${table}.js`;
    console.log(filePath);

    // Verifying if the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Importing entity informations
    const entityInfo = await import(`../../../${filePath}`);

    // Verifying if there is a permission hook for this Query
    await permissionHook(entityInfo, table, args, QueryType);

    // Verification if the query is a mutation query
    if (QueryType === 'Mutation') {
      const res = await beforeResolverMutation(table, entityInfo, args);
      return res;
    }
    return args;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Constructor for MongoDBConnection class.
 * @param {string} table - Name of current table.
 * @param {object} args - Args with input information.
 * @param {object} column - Actual column on iteration.
 * @returns {Promise<object[]>} - Modified args or same args.
 */
const beforeResolverRelations = async (table, args, column, parent) => {
  let tempArgs = args;
  // for mongodb searching parents
  if (table.database.type === 'mongodb') {
    //const idValue = ObjectId.isValid(parent[column.name]) ? parent[column.name].toString() : parent[column.name];
    args = { input: { filter: { _and: { [column.foreignKey]: { _eq: parent.id } } } } };
    // for MySQL searching parents
  } else {
    args = { input: { filter: { [column.foreignKey]: parent[column.foreignKey] } } };
  }

  // Verification of take and skip inside input
  tempArgs.take ? (args.input.take = tempArgs.take) : '';
  tempArgs.skip ? (args.input.skip = tempArgs.skip) : '';

  return args;
};

export { beforeResolver, beforeResolverRelations };
