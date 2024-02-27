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
      // logger.info('Executing SQL query:', sql);
      // logger.info('SQL query values:', values);
      // console.log('----- aqui', values, sql);
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
    //console.log({ tableName, input });
    const { filter } = input;

    // Default LIMIT and OFFSET values
    const defaultLimit = 100; // Change this value to whatever default limit you desire
    const defaultOffset = 0;

    // Set the timeout value in seconds
    const timeoutSeconds = 60; // Change this value to your desired timeout

    // If no filters are provided, return all rows from the table
    if (!filter || Object.keys(filter).length === 0) {
      const take = input.take || defaultLimit;
      const skip = input.skip || defaultOffset;

      let sql;
      if (take && skip) {
        sql = `SELECT * FROM ${tableName} LIMIT ${take} OFFSET ${skip}`;
      } else if (take) {
        sql = `SELECT * FROM ${tableName} LIMIT ${take}`;
      } else if (skip) {
        sql = `SELECT * FROM ${tableName} LIMIT ${defaultLimit} OFFSET ${skip}`;
      } else {
        sql = `SELECT * FROM ${tableName} LIMIT ${defaultLimit}`;
      }

      try {
        const res = await this.query({ sql, timeout: timeoutSeconds * 1000 });
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
    const take = input.take || defaultLimit;
    const skip = input.skip || defaultOffset;

    let sql;
    if (take && skip) {
      sql = `SELECT * FROM ${tableName} WHERE ${whereClause} LIMIT ${take} OFFSET ${skip}`;
    } else if (take) {
      sql = `SELECT * FROM ${tableName} WHERE ${whereClause} LIMIT ${take}`;
    } else if (skip) {
      sql = `SELECT * FROM ${tableName} WHERE ${whereClause} LIMIT ${defaultLimit} OFFSET ${skip}`;
    } else {
      sql = `SELECT * FROM ${tableName} WHERE ${whereClause} LIMIT ${defaultLimit}`;
    }

    try {
      const res = await this.query({ sql, values, timeout: timeoutSeconds * 1000 });
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
    const keys = Object.keys(create[0]);
    const values = create.map((item) => Object.values(item));
    //console.log(values);
    const fields = keys.join(', ');
    const sql = `INSERT INTO ${tableName} (${fields}) VALUES ${values.map(() => `(?)`).join(', ')}`;
    //console.log(sql);
    try {
      const res = await this.query(sql, values); // for debugging purposes if needed
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
    const where = keys.map((key) => `${key} IN (?)`).join(' AND ');
    const set = Object.entries(update)
      .map(([key]) => `${key} = ?`)
      .join(', ');
    const sql = `UPDATE ${tableName} SET ${set} WHERE ${where}`;
    //console.log(sql);
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
    const where = keys.map((key) => `${key} IN (?)`).join(' AND ');
    const sql = `DELETE FROM ${tableName} WHERE ${where}`;
    try {
      // Execute the first query to disable foreign key checks
      await this.query('SET FOREIGN_KEY_CHECKS=0;');
      // Execute the second query to delete the records
      const res = await this.query(sql, values);
      // Execute the third query to enable foreign key checks
      await this.query('SET FOREIGN_KEY_CHECKS=1;');
      return { deleted: res.affectedRows };
    } catch (error) {
      console.error('Error:', error);
      return null; // Return null if there's an error
    }
  }
}
