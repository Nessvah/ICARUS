import fs from 'fs';
import { MongoDBConnection } from './mongodbClass.js';
import { MySQLConnection } from './mysqlClass.js';
import { MongoClient } from 'mongodb';
import mysql from 'mysql2/promise';
import { logger } from '../server.js';
import knex from 'knex';
import { cli } from 'winston/lib/winston/config/index.js';

let data;
try {
  data = JSON.parse(fs.readFileSync('../src/config.json', 'utf8'));
} catch (error) {
  logger.error('error to read file');
}

//a pool of many different database connections.
const pools = [];

/**
 * Controller function for handling database operations based on the provided table and arguments.
 *
 * @param {string} table - The name of the table for the database operation.
 * @param {Object} args - Arguments containing the input for the operation.
 * @param {Object} args.input - Input parameters for the database operation.
 * @param {string} args.input.action - The CRUD action to perform (e.g., 'FIND', 'CREATE', 'UPDATE', 'DELETE').
 *
 * @returns {Promise<*>|string} - A promise that resolves to the result of the database operation,
 *                              or a string indicating that the action is not defined.
 * @throws {Error} - Throws an error if the specified table is not found in the pool or if there is an issue
 *                  during the database operation.
 */
async function controller(table, args) {
  try {
    //find the right database in the pool, base on table name.
    const currentTable = await pools.find((db) => db.table === table);

    // check if there really is that table in the pool
    if (!currentTable) {
      throw new Error('Table not found in the pool.');
    }

    let connection;

    //create a connection class to the specific database type, that will have all
    //the CRUD functions to be use.
    switch (currentTable.type) {
      case 'mongodb':
        connection = new MongoDBConnection(currentTable);
        break;
      case 'mysql':
        connection = new MySQLConnection(currentTable);
        break;
    }

    const { action } = args.input;
    //filter the CRUD function passed in the action input.
    switch (action) {
      case 'FIND':
        return await connection.find(table, args);
      case 'CREATE':
        return await connection.create(table, args);
      case 'UPDATE':
        return await connection.update(table, args);
      case 'DELETE':
        return await connection.delete(table, args);
      default:
        return 'Action not defined';
    }
  } catch (error) {
    logger.error(error);
  }
}

//create a pool connection to many databases, based on the config files in the "data" variable.
async function createDbPool() {
  try {
    //! forEach() expects a synchronous function — it does not wait for promises.
    // This can result in a race condition, where some operations might not be
    // finished when the loop completes

    // Switching to for ... of

    for (const table of data.tables) {
      const dbType = table.database.type;

      let client;

      switch (dbType) {
        case 'mongodb':
          client = new MongoClient(table.database.uri, { maxPoolSize: 10 });
          await client.connect();
          pools.push({
            table: table.name,
            type: table.database.type,
            databaseName: table.database.databaseName,
            columns: table.columns,
            pool: client,
          });
          break;
        case 'mysql':
          client = await mysql.createConnection({
            host: table.database.host,
            user: table.database.user,
            password: table.database.password,
            database: table.database.databaseName,
            port: table.database.port,
          });
          console.log(client);
          pools.push({
            table: table.name,
            type: table.database.type,
            databaseName: table.database.databaseName,
            columns: table.columns,
            pool: knex({
              client: 'mysql2',
              connection: client,
              pool: { min: 2, max: 10 },
            }),
          });
          break;
      }
    }
  } catch (error) {
    logger.error('error creating database pool: ', error);
  }
}

export { controller, createDbPool };
