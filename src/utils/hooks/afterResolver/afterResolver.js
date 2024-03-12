import { afterResolverMongoDB } from './afterResolverMongoDB.js';
import { afterResolverMySQL } from './afterResolverMySQL.js';

/**
 * Constructor for MongoDBConnection class.
 * @param {Array} res - The array with responses.
 * @param {string} dbName - Database name (mongodb or mysql).
 * @returns {<object[]>} - Modified args or same args.
 */
const afterResolver = (res, dbName) => {
  try {
    switch (dbName) {
      case 'mongodb':
        return afterResolverMongoDB(res);
      case 'mysql':
        return afterResolverMySQL(res);
    }
  } catch (e) {
    throw new Error(e);
  }
};

export { afterResolver };
