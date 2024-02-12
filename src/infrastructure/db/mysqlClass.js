import { logger } from '../server.js';
export class MySQLConnection {
  constructor(currentTableInfo) {
    this.pool = currentTableInfo.pool;
  }

  async getConnection() {
    return this.pool.getConnection();
  }

  /**
   * * Executes a SQL query with optional parameter values.
   * @param {string} sql - The SQL query to execute.
   * @param {Array} values - Optional parameter values for the query.
   * @returns {Promise<Array>} - A promise that resolves to the result rows of the query.
   * @throws {Error} - If an error occurs during the query execution.
   */
  async query(sql, values) {
    const connection = await this.getConnection();
    try {
      logger.info('Connection successful!');
      const [rows] = await connection.query(sql, values);
      return rows;
    } catch (error) {
      throw new Error('error find sql');
    } finally {
      connection.release();
    }
  }
  /**
   * * Executes a SQL query with optional parameter values.
   * @param {string} sql - The SQL query to execute.
   * @param {Array} values - Optional parameter values for the query.
   * @returns {Promise<Array>} - A promise that resolves to the result rows of the query.
   * @throws {Error} - If an error occurs during the query execution.
   */
  async find(tableName, { input }) {
    const { filter } = input;
    const keys = Object.keys(filter);
    const values = Object.values(filter);
    const where = keys.map((key) => `${key} = ?`).join(' AND ');
    const sql = `SELECT * FROM ${tableName} WHERE ${where}`;
    try {
      const res = await this.query(sql, values);
      return res; // Return the result of the query
    } catch (error) {
      logger.error('Error:', error);
      return null; // Return null if there's an error
    }
  }

  /**
   * * Creates a new record in the specified table.
   * @param {string} tableName - The name of the table to create a record in.
   * @param {{ input: { create: Array<Object> } }} data - The input data for the create operation.
   * @returns {Promise<{ created: Array<Object> } | null>} - A promise that resolves to the created record(s) or null if there was an error.
   */
  async create(tableName, { input }) {
    const { create } = input;
    const keys = Object.keys(create[0]);
    const values = create.map((item) => Object.values(item));
    const fields = keys.join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`;
    try {
      const res = await this.query(sql, values.flat()); // for debugging purposes if needed
      logger.info(res);
      return { created: create };
    } catch (error) {
      logger.error('Error:', error);
      return null; // Return null if there's an error
    }
  }

  /**
   * * Updates a record in the specified table based on the specified filter criteria.
   * @param {string} tableName - The name of the table to update a record in.
   * @param {{ input: { filter: Object, update: Object } }} data - The input data for the update operation.
   * @returns {Promise<{ updated: Array<Object> } | null>} - A promise that resolves to the updated record(s) or null if there was an error.
   */
  async update(tableName, { input }) {
    const { filter, update } = input;
    const keys = Object.keys(filter);
    const values = Object.values(filter);
    const where = keys.map((key) => `${key} = ?`).join(' AND ');
    const set = Object.entries(update)
      .map(([key]) => `${key} = ?`)
      .join(', ');
    const sql = `UPDATE ${tableName} SET ${set} WHERE ${where}`;
    try {
      const res = await this.query(sql, [...Object.values(update), ...values]); // for debugging purposes if needed
      logger.info(res);
      return { updated: await this.find(tableName, { input }) };
    } catch (error) {
      logger.error('Error:', error);
      return null; // Return null if there's an error
    }
  }
  /**
   * * Deletes a record from the specified table based on the specified filter.
   * @param {string} tableName - The name of the table from which to delete a record.
   * @param {{ input: { filter: Object } }} data - The input data for the delete operation.
   * @returns {Promise<{ deleted: number } | null>} - A promise that resolves to the number of affected rows or null if there was an error.
   */
  async delete(tableName, { input }) {
    const { filter } = input;
    const keys = Object.keys(filter);
    const values = Object.values(filter);
    const where = keys.map((key) => `${key} = ?`).join(' AND ');
    const sql = `DELETE FROM ${tableName} WHERE ${where}`;
    try {
      const res = await this.query(sql, values);
      return { deleted: res.affectedRows };
    } catch (error) {
      logger.error('Error:', error);
      return null; // Return null if there's an error
    }
  }
}
