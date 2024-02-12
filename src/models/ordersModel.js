import { connectDB } from '../infrastructure/db/mssql.js';

const pool = await connectDB();

const ordersById = async (id) => {
  const query = `SELECT * FROM orders WHERE order_id = ?;`;
  try {
    const orders = await pool.query(query, [id]);
    return orders[0][0];
  } catch (e) {
    throw new Error(e);
  }
};

const allOrders = async () => {
  const query = `SELECT * FROM orders`;
  try {
    const orders = await pool.query(query);
    return orders[0];
  } catch (e) {
    throw new Error(e);
  }
};

export { ordersById, allOrders };
