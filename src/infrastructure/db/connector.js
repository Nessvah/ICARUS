import fs from 'fs';
import { MongoDBConnection } from './mongodbClass.js';
import { MySQLConnection } from './mysqlClass.js';
import { MongoClient } from 'mongodb';
import mysql from 'mysql2/promise';
import { logger } from '../server.js';

let data;
try {
  data = JSON.parse(fs.readFileSync('../src/config.json', 'utf8'));
} catch (error) {
  logger.error('error to read file');
}

//a pool of many different database connections.
const pools = [];

//this function will be called in the resolvers, and will filter the requests to all databases and response properly.
async function controller(table, args) {
  let connection;
  //find the right database in the pool, base on table name.
  let currentTable = await pools.find((db) => db.table === table);

  //create a connection class to the specific database type, that will have all the CRUD functions to be use.
  try {
    switch (currentTable.type) {
      case 'mongodb':
        connection = new MongoDBConnection(currentTable);
        break;
      case 'mysql':
        connection = new MySQLConnection(currentTable);
        break;
    }

    const action = args.input._action || 'filter';

    //filter the CRUD function passed in the action input.
    switch (action) {
      case 'filter':
        return await connection.find(table, args);
      case 'COUNT':
        return await connection.count(table, args);
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
    }
  });
}

export { controller, createDbPool };
