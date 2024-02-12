import { connectDB } from '../infrastructure/db/mssql.js';

const pool = await connectDB();

const allOrderItems = async () => {
  const orderItemsQuery = `SELECT * FROM order_items LIMIT 100`;
  try {
    const orderItems = await pool.query(orderItemsQuery);
    return orderItems[0];
  } catch (e) {
    throw new Error(e);
  }
};

const orderItemsById = async (id) => {
  const query = `SELECT * FROM order_items WHERE order_item_id = ?`;
  try {
    const response = await pool.query(query, [id]);
    return response[0][0];
  } catch (e) {
    throw new Error(e);
  }
};
export { allOrderItems, orderItemsById };
