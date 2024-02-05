import { connectDB } from '../infrastructure/db/mssql.js';

// open a connection
let conn;

const allProducts = async () => {
  const query = 'SELECT * FROM products;';
  try {
    // get a connection
    conn = await connectDB.getConnection();
    const products = await conn.query(query);
    return products[0];
  } catch (e) {
    throw new Error('Error while querying products');
  }
};

const productById = async (connection, id) => {
  const query = `SELECT * FROM products WHERE product_id = $${id}`;
  try {
    const product = await connection.query(query, [id]);
    return product.rows[0];
  } catch (e) {
    throw new Error(e);
  }
};

export { allProducts, productById };
