// Get the client
import mysql from 'mysql2/promise';

async function connectDB() {
  try {
    // Create the connection to database
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      database: process.env.MYSQL_DATABASE || 'localIcarus',
      password: process.env.MYSQL_PWD || '',
      port: process.env.MYSQL_PORT || 3306,
    });

    console.log('connected to ec2 mysql ');

    const tables = await connection.query('SHOW DATABASES;');
    console.log(tables);
  } catch (err) {
    console.log(err);
  }
}

export { connectDB };
