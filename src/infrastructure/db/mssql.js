// Get the client
import mysql from 'mysql2/promise';
import { logger } from '../server.js';

const { MYSQL_HOST, MYSQL_USER, MYSQL_PWD, MYSQL_DATABASE, MYSQL_PORT } = process.env;

async function connectDB() {
  try {
    // Create the connection to database
    const connection = await mysql.createConnection({
      host: MYSQL_HOST,
      user: MYSQL_USER,
      database: MYSQL_DATABASE,
      port: MYSQL_PORT,
      password: MYSQL_PWD,
    });

    logger.info('connected to ec2 mysql ');

    /*const queryTablesSchema =
      "SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'icarus' AND table_name = 'products'";

    //const dbSchema = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'icarus';"; */

    const tables = await connection.query('SELECT * FROM products LIMIT 10;');
    logger.info(tables);
  } catch (err) {
    logger.error(err);
  }
}

export { connectDB };
