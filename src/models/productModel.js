import { connectDB } from '../infrastructure/db/mssql.js';
import { logger } from '../infrastructure/server.js';

// open a connection
const pool = await connectDB();

const allProducts = async () => {
  const query = 'SELECT * FROM products;';
  try {
    const products = await pool.query(query);
    return products[0];
  } catch (e) {
    throw new Error('Error while querying products');
  }
};

const productById = async (id) => {
  const query = `SELECT * FROM products WHERE product_id = ${id}`;
  try {
    const product = await pool.query(query, [id]);
    logger.info(product[0]);
    return product;
  } catch (e) {
    throw new Error(e);
  }
};

export { allProducts, productById };
