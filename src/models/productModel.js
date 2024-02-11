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
    //logger.info(product[0]);
    return product;
  } catch (e) {
    throw new Error(e);
  }
};

const productByName = async (name) => {
  const query = `SELECT * FROM products WHERE product_name = '${name}'`;
  try {
    const productsResponse = await pool.query(query, [name]);
    const products = productsResponse[0];
    return products;
  } catch (e) {
    throw new Error(e);
  }
};

const productsByPrice = async (min, max) => {
  const query = `SELECT * FROM products WHERE price > ${min} AND price < ${max}`;
  try {
    const productsResponse = await pool.query(query, [min, max]);
    const products = productsResponse[0];
    return products;
  } catch (e) {
    throw new Error(e);
  }
};

const createProduct = async (input) => {
  const { description, icon_class, icon_label, price, product_name } = input;
  const query = `INSERT INTO products (description, icon_class, icon_label, price, product_name) VALUES (?, ?, ?, ?, ?)`;
  const values = [description, icon_class, icon_label, price, product_name];
  try {
    const productCreationResponse = await pool.query(query, values);
    const insertedProduct = productCreationResponse[0].insertId;
    const productData = await pool.query('SELECT * FROM products WHERE product_id = ?', [insertedProduct]);
    return productData[0];
  } catch (e) {
    throw new Error(e);
  }
};

export { allProducts, productById, productByName, productsByPrice, createProduct };
