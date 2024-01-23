import sql from 'mssql';

const sqlConfig = {
  user: `${process.env.DB_USER}`,
  password: `${process.env.DB_PWD}`,
  server: `${process.env.DB_HOST}`,
  database: `${process.env.DB_DATABASE}`,
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
      //console.log('connected to rds');
    }
  } catch (error) {
    //console.error(error);
  }
}

export { connectDB };
