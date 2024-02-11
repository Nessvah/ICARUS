import { connectDB } from '../infrastructure/db/mssql.js';

const pool = await connectDB();

const categoriesProperties = async () => {
  const query = `SHOW columns FROM categories`;
  try {
    const columnsResponse = await pool.query(query);
    return columnsResponse[0];
  } catch (e) {
    throw new Error(e);
  }
};

const customersProperties = async () => {
  const query = `SHOW columns FROM customers`;
  try {
    const columnsResponse = await pool.query(query);
    return columnsResponse[0];
  } catch (e) {
    throw new Error(e);
  }
};

const orderItemsProperties = async () => {
  const query = `SHOW columns FROM order_items`;
  try {
    const columnsResponse = await pool.query(query);
    return columnsResponse[0];
  } catch (e) {
    throw new Error(e);
  }
};

const ordersProperties = async () => {
  const query = `SHOW columns FROM orders`;
  try {
    const columnsResponse = await pool.query(query);
    return columnsResponse[0];
  } catch (e) {
    throw new Error(e);
  }
};

const productReviewsProperties = async () => {
  const query = `SHOW columns FROM product_reviews`;
  try {
    const columnsResponse = await pool.query(query);
    return columnsResponse[0];
  } catch (e) {
    throw new Error(e);
  }
};

const productsProperties = async () => {
  const query = `SHOW columns FROM products`;
  try {
    const columnsResponse = await pool.query(query);
    return columnsResponse[0];
  } catch (e) {
    throw new Error(e);
  }
};

const shipmentsProperties = async () => {
  const query = `SHOW columns FROM shipments`;
  try {
    const columnsResponse = await pool.query(query);
    return columnsResponse[0];
  } catch (e) {
    throw new Error(e);
  }
};

export {
  categoriesProperties,
  customersProperties,
  orderItemsProperties,
  ordersProperties,
  productReviewsProperties,
  productsProperties,
  shipmentsProperties,
};
