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
    throw new Error('Error while querying customer: ', e);
  }
};

const customerByEmail = async (email) => {
  const query = `SELECT * FROM customers WHERE email = ?`;
  try {
    const customer = await pool.query(query, [email]);
    return customer;
  } catch (e) {
    throw new Error('Error while querying customer: ', e);
  }
};

const createNewCustomer = async (input) => {
  const { email, customer_name, icon_class, icon_label } = input;
  const query = `INSERT INTO customers (email, customer_name, icon_class, icon_label) VALUES (?, ?, ?, ?)`;
  const values = [email, customer_name, icon_class, icon_label];
  try {
    const customerCreationResponse = await pool.query(query, values);
    const insertedCustomer = customerCreationResponse[0].insertId;
    const customerData = await pool.query('SELECT * FROM customers WHERE customer_id = ?', [insertedCustomer]);
    return customerData[0];
  } catch (e) {
    throw new Error(e);
  }
};

const updateCustomer = async (id, input) => {
  let query = 'UPDATE customers SET ';
  const params = [];
  const updates = [];
  try {
    for (const key in input) {
      updates.push(`${key} = ?`);
      params.push(input[key]);
    }
    query += updates.join(', ');
    query += ' WHERE customer_id = ?';
    /*example of updating multiple columns
       set  first_name='Jim',
       last_name='Don'
       where id=1;*/
    params.push(id);
    await pool.query(query, params);
    const customerData = await pool.query('SELECT * FROM customers WHERE customer_id = ?', [id]);
    return customerData[0];
  } catch (e) {
    throw new Error(e);
  }
};

const deleteCustomer = async (id) => {
  const query = `DELETE FROM customers WHERE customer_id = ?`;
  try {
    const result = await pool.query(query, [id]);
    const affectedRows = result ? result[0]['affectedRows'] : 0;
    if (affectedRows === 1) {
      return { message: `Customer deleted successfully, affectedRows: ${affectedRows}` };
    } else {
      return { message: `Customer not deleted, affectedRows: ${affectedRows}` };
    }
  } catch (e) {
    throw new Error(e);
  }
};

export { allCustomers, customerById, customerByEmail, createNewCustomer, updateCustomer, deleteCustomer };
