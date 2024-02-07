import { connectDB } from '../infrastructure/db/mssql.js';

const pool = await connectDB();

const allCustomers = async () => {
  const query = `SELECT * FROM customers`;
  try {
    const customers = await pool.query(query);
    return customers[0];
  } catch (e) {
    throw new Error('Error while querying customers');
  }
};

const customerById = async (id) => {
  const query = `SELECT * FROM customers WHERE customer_id = ${id}`;
  try {
    const customer = await pool.query(query, [id]);
    return customer;
  } catch (e) {
    throw new Error(e);
  }
};

export { allCustomers, customerById };
