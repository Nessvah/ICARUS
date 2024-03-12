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

    // Verifying if the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Importing entity informations
    const entityInfo = await import(`../../${filePath}`);

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

export { beforeResolver };
