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
      logger.info('Executing SQL query:', sql);
      logger.info('SQL query values:', values);
      const [rows] = await connection.query(sql, values);
      return rows;
    } catch (error) {
      logger.error('Error executing SQL query:', error);
      throw new Error('Error executing SQL query');
    } finally {
      connection.release();
    }
  }

  async find(tableName, { input }) {
    console.log({ tableName, input });
    const { filter } = input;

    // If no filters are provided, return all rows from the table
    if (!filter || Object.keys(filter).length === 0) {
      const sql = `SELECT * FROM ${tableName}`;
      try {
        const res = await this.query(sql);
        return res; // Return all rows from the table
      } catch (error) {
        console.error('Error:', error);
        return null; // Return null if there's an error
      }
    }

    // Construct WHERE clause with only relevant filters
    const whereConditions = [];
    const values = [];

    Object.entries(filter).forEach(([column, columnValues]) => {
      if (Array.isArray(columnValues) && columnValues.length > 0) {
        const placeholders = columnValues.map(() => '?').join(', ');
        whereConditions.push(`${column} IN (${placeholders})`);
        values.push(...columnValues);
      }
    });

    const whereClause = whereConditions.join(' AND ');

    // Construct SQL query with WHERE clause
    const sql = `SELECT * FROM ${tableName} WHERE ${whereClause}`;

    try {
      const res = await this.query(sql, values);
      return res; // Return the result of the query
    } catch (error) {
      console.error('Error:', error);
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
    const valuesArray = create.map((item) => Object.values(item));
    const keys = Object.keys(create[0]);
    const fields = keys.join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${fields}) VALUES ${valuesArray.map(() => `(${placeholders})`).join(', ')}`;

    try {
      await Promise.all(valuesArray.map((values) => this.query(sql, values)));
      logger.info(`Create operation executed successfully.`);
      return { created: create.map((item) => ({ ...item })) };
    } catch (error) {
      logger.error(`Error executing create operation: ${error}`);
      return null;
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

    // Extract filter keys and values
    const filterKeys = Object.keys(filter);
    const filterValues = Object.values(filter);

    // Construct WHERE clause for filtering
    const whereConditions = filterKeys.map((key) => `${key} = ?`).join(' AND ');

    // Initialize an array to hold the SET clauses
    const setClauses = [];

    // Extract update keys and values and construct SET clauses
    for (const item of update) {
      const setClause = Object.keys(item)
        .map((key) => `${key} = ?`)
        .join(', ');
      setClauses.push(setClause);
    }

    // Construct the SET part of the SQL query
    const setPart = setClauses.join(', ');

    // Construct the SQL query
    const sql = `UPDATE ${tableName} SET ${setPart} WHERE ${whereConditions}`;

    try {
      const res = await this.query(sql, [...Object.values(update), ...values]); // for debugging purposes if needed
      return { updated: await this.find(tableName, { input }) };
    } catch (error) {
      console.error('Error:', error);
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
      const res = await this.query(sql, [values]);
      return { deleted: res.affectedRows };
    } catch (error) {
      logger.error('Error:', error);
      return null; // Return null if there's an error
    }
  }
}
