import { MongoDBConnection } from '../../../infrastructure/db/mongodbClass';
import { MySQLConnection } from '../../../infrastructure/db/mysqlClass';
import { createDbPool } from '../../../infrastructure/db/connector';

export async function afterUploadResolver(folder) {
  const pools = createDbPool.pools;
  console.log(pools);
  // Retrieve the database type corresponding to the provided table name
  const dbType = pools.find((db) => db.table === folder)?.type;
  if (!dbType) {
    throw new Error(`Table '${tableName}' not found in the configuration.`);
  }

  // Perform different actions based on the database type
  switch (dbType) {
    case 'mongodb':
      // Call _update function in MongoDB class
      const mongoDBConnection = new MongoDBConnection(currentTableInfo);
      return mongoDBConnection.update(tableName, {
        /* how the f*** imma gonna get the input.filter to apply to the foreign table */
      });
    case 'mysql':
      // Call _update function in MySQL class
      const mySQLConnection = new MySQLConnection(currentTableInfo);
      return mySQLConnection._update(tableName, {
        /* how the f*** imma gonna get the input.filter to apply to the foreign table */
      });
    default:
      throw new Error(`Unsupported database type: '${dbType}'`);
  }
}

//Todo: get a smarter brain
