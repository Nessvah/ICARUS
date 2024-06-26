import { MongoDBConnection } from './mongodbClass.js';
import { MySQLConnection } from './mysqlClass.js';
import { S3Connection } from './s3Class.js';
import { MongoClient } from 'mongodb';
import mysql from 'mysql2/promise';
import { logger } from '../server.js';
import { config } from '../../graphql/generateTypeDefs.js';
import { S3 } from '@aws-sdk/client-s3';

//a pool of many different database connections.
const pools = [];

/**
 ** This function will be called in the resolvers, and will filter the requests to all databases and response properly.
 * @param {string} table - name of the table.
 * @param {object} args - args have all the information passed to the query or mutation, and define the action that will be made in the controllers.
 */
async function controller(tableName, args, table) {
  let connection;

  //find the right database in the pool, base on table name.
  const currentTable = await pools.find((db) => db.table === tableName);
  //create a connection class to the specific database type, that will have all the CRUD functions to be use.
  try {
    switch (currentTable.type) {
      case 'mongodb':
        connection = new MongoDBConnection(currentTable);
        break;
      case 'mysql':
        connection = new MySQLConnection(currentTable);
        break;
      case 's3':
        connection = new S3Connection(currentTable);
        break;
      default:
        throw Error('Invalid Database Type');
    }
    //define the CRUD function based on the _action passed in the input.
    let action;
    for (const key in args.input) {
      if (key.startsWith('_')) {
        action = key;
      } else {
        action = 'filter';
      }
    }

    //filter the CRUD function passed in the action input.
    switch (action) {
      case 'filter':
        return await connection.find(tableName, args);
      case '_count':
        return await connection.count(tableName, args);
      case '_create':
        return await connection.create(tableName, args, table);
      case '_update':
        return await connection.update(tableName, args);
      case '_delete':
        return await connection.delete(tableName, args);
      case '_upload':
        return await connection.upload(tableName, args, table);
      /* // Update the respective database with the S3 URL
      if (table.upload.type === 's3') {
        return await connection.s3UploadLogic(tableName, args, table);

} (table.upload.type === 'filesystem'){
  return await connection.fsUploadLogic(tableName, args, table);

}
return { uploaded: s3Url };
 */

      default:
        return 'Action not defined';
    }
  } catch (error) {
    logger.error(error);
  }
}

/**
 ** Create a pool connection to many databases, based on the config files in the "data" variable.
 * @param {object} config - is a object with the tables configurations to create the database pool.
 */
async function createDbPool() {
  let data = config;
  data.tables.forEach(async (table) => {
    let client;
    switch (table.database.type) {
      case 'mongodb':
        client = new MongoClient(table.database.uri, { maxPoolSize: 10 });
        client.connect();
        pools.push({
          table: table.name,
          type: table.database.type,
          databaseName: table.database.databaseName,
          columns: table.columns,
          pool: client,
        });
        break;
      case 'mysql':
        client = mysql.createPool({
          host: table.database.host,
          user: table.database.user,
          password: table.database.password,
          database: table.database.databaseName,
          port: table.database.port,
          connectionLimit: 10,
        });
        pools.push({
          table: table.name,
          type: table.database.type,
          databaseName: table.database.databaseName,
          columns: table.columns,
          pool: client,
        });
        break;
      case 's3':
        client = new S3({
          region: table.database.region,
          credentials: {
            accessKeyId: table.database.accessKeyId,
            secretAccessKey: table.database.secretAccessKey,
          },
          sslEnabled: false,
          s3ForcePathStyle: true,
          bucket: table.database.bucket,
        });
        pools.push({
          table: table.name,
          type: table.database.type,
          bucket: table.database.bucket,
          region: table.database.region,
          columns: table.columns,
          pool: client,
        });
        break;
      default:
        throw Error('Invalid Database Type');
    }
  });
}

export { controller, createDbPool, pools };
