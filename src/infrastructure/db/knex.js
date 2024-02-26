// server.js
import Knex from 'knex';
const knex = Knex({
  client: 'mysql2',
  connection: {
    host: '16.171.102.168',
    user: 'icarus_devs',
    password: 'YP6w@gsuJLe^kS',
    database: 'icarus',
    port: 3306,
  },
  pool: {
    // Pool configuration
    max: 10, // Maximum number of connections in the pool
    acquireTimeoutMillis: 60000, // Timeout in milliseconds to acquire a connection before throwing an error
    idleTimeoutMillis: 60000, // Time in milliseconds a connection can be idle before it is released
  },
});

export class MySQLConnection {
  constructor(currentTableInfo) {
    // No need to store pool information in MySQLConnection as Knex.js manages connections internally
  }

  async find(tableName, { input }) {
    const { filter } = input;
    try {
      let query = knex(tableName);
      if (filter) {
        query = query.where(filter);
      }
      const res = await query;
      return res;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async create(tableName, { input }) {
    const { create } = input;
    try {
      const res = await knex(tableName).insert(create);
      return { created: res };
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async update(tableName, { input }) {
    const { filter, update } = input;
    try {
      const res = await knex(tableName).where(filter).update(update);
      return { updated: res };
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async delete(tableName, { input }) {
    const { filter } = input;
    try {
      const res = await knex(tableName).where(filter).del();
      return { deleted: res };
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
}
// Create an instance of MySQLConnection
const connection = new MySQLConnection();

// Example usage of the find method
const findExample = async () => {
  const tableName = 'users';
  const filter = { age: { $gt: 18 } }; // Example filter object
  const result = await connection.find(tableName, { input: { filter } });
  console.log(result);
};
findExample();

/* // Example usage of the create method
const createExample = async () => {
  const tableName = 'customers';
  const create = { customer_name: 'John Doe', email: 'nheco@nheco.nheco' }; // Example create object
  const result = await connection.create(tableName, { input: { create } });
  console.log(result);
};
createExample();
 */
// Example usage of the update method
const updateExample = async () => {
  const tableName = 'customers';
  const filter = { id: 6970 }; // Example filter object
  const update = { customer_name: 'Asdrúbio' }; // Example update object
  const result = await connection.update(tableName, { input: { filter, update } });
  console.log(result);
};
updateExample();

/* // Example usage of the delete method
const deleteExample = async () => {
  const tableName = 'users';
  const filter = { id: 1 }; // Example filter object
  const result = await connection.delete(tableName, { input: { filter } });
  console.log(result);
};
deleteExample();
 */
