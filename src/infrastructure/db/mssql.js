// Get the client
import mysql from 'mysql2/promise';

const { MYSQL_HOST, MYSQL_USER, MYSQL_PWD, MYSQL_DATABASE, MYSQL_PORT } = process.env;

async function connectDB() {
  try {
    // Create the connection to database
    const pool = mysql.createPool({
      host: MYSQL_HOST,
      user: MYSQL_USER,
      database: MYSQL_DATABASE,
      port: MYSQL_PORT,
      password: MYSQL_PWD,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
      idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    console.log('connected to ec2 mysql ');

    /* const connection = await pool.getConnection();
    const [tables] = await connection.execute('SELECT * FROM order_items', [MYSQL_DATABASE]); */

    //console.log(tables);
    /*const queryTablesSchema =
      "SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'icarus' AND table_name = 'products'";

    //const dbSchema = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'icarus';"; */

    return pool;
  } catch (err) {
    console.error(err);
  }
}

export { connectDB };
