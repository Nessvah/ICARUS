// Get the client
import mysql from 'mysql2/promise';

const { MYSQL_HOST, MYSQL_USER, MYSQL_PWD, MYSQL_DATABASE, MYSQL_PORT } = process.env;

async function connectDB() {
  try {
    // Create the connection to database
    const connection = mysql.createPool({
      host: MYSQL_HOST,
      user: MYSQL_USER,
      database: MYSQL_DATABASE,
      port: MYSQL_PORT,
      password: MYSQL_PWD,
      connectionLimit: 10,
    });

    console.log('connected to ec2 mysql ');

    /*const queryTablesSchema =
      "SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'icarus' AND table_name = 'products'";

    //const dbSchema = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'icarus';"; */

    // const tables = await connection.query('SELECT * FROM products LIMIT 10;');
    return connection;
  } catch (err) {
    console.error(err);
  }
}

export { connectDB };
