import sql from 'mssql';

const sqlConfig = {
  user: 'admin',
  password: 'admin123',
  server: 'icarus-sql-server.cr6kusygg978.eu-north-1.rds.amazonaws.com',
  database: 'Icarus',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

async function connectDB() {
  try {
    if (!sql.isConnected) {
      await sql.connect(sqlConfig);
      // console.log('connected to rds');
    }
  } catch (error) {
    //  console.error(error);
  }
}

export { connectDB };
