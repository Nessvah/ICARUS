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
const pools = [];

//Get the reference name off the user service, verify what database type, create a url, transform the "connection" variable
//to the MongoDBConnection class, start the connection to the database, and start the connection.

async function controller(table, args) {
  let connection;
  let currentTable = await pools.find((db) => db.table === table);

  try {
    switch (currentTable.type) {
      case 'mongodb':
        connection = new MongoDBConnection(currentTable);
        break;
      case 'mysql':
        connection = new MySQLConnection(currentTable);
        break;
    }

    switch (args.input.action) {
      case 'find':
        return await connection.find(table, args);
      case 'create':
        return await connection.create(table, args);
      case 'update':
        return await connection.update(table, args);
      case 'delete':
        return await connection.delete(table, args);
      default:
        return 'Action not defined';
    }
  } catch (error) {
    logger.error(error);
  }
}

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
