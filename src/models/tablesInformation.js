import { connectDB } from '../infrastructure/db/mssql.js';

const pool = await connectDB();

const allTables = async () => {
  const query = `SHOW TABLES`;
  try {
    const response = await pool.query(query);
    return response;
  } catch (e) {
    throw new Error('Error while querying tables ', e);
  }
};

export { allTables };
