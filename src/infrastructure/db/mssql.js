// Get the client
import mysql from 'mysql2/promise';

async function connectDB() {
  try {
    // Create the connection to database
    const connection = await mysql.createConnection({
      host: 'ec2-13-49-245-170.eu-north-1.compute.amazonaws.com',
      user: 'root',
      // database: 'icarus',
      port: 3306,
      password: 'admin123',
    });

    console.log('connected to ec2 mysql ');

    const tables = await connection.query('SHOW DATABASES;');
    console.log(tables);
  } catch (err) {
    console.log(err);
  }
}

export { connectDB };
