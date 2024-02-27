/* eslint-disable no-prototype-builtins */

import { buildSkipAndTakeClause, processFilter } from '../../utils/sqlQueries.js';
import { logger } from '../server.js';

export class MySQLConnection {
  constructor(currentTableInfo) {
    this.pool = currentTableInfo.pool;
  }

  async getConnection() {
    logger.warn('getting mysql conn from pool...');
    return await this.pool.getConnection();
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
      // get only the rows with the info and not the schema
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
    // start constructing the sql query
    let sql = `SELECT * FROM ${tableName}`;

    // array to save the values
    const values = [];

    // check if the filter options is present and if it is
    // take all the nested information and construct a sql query to filter
    if (input.filter) {
      const { processedSql, processedValues } = processFilter(input);

      // append values from filters and the where sql string
      values.push(...processedValues);
      sql += processedSql;
    }

    // if in the input we have find and/or take in our filters, we need
    // to make pagination and construct the sql query

    if (input.skip || input.take) {
      logger.warn('inside skip and take');

      const { paginationSql, paginationValues } = buildSkipAndTakeClause(input);

      sql += paginationSql;
      values.push(...paginationValues);

      // If no logical operators are provided, return all rows from the table
      // or the input doesnt have the filter property
    }

    logger.warn(sql);
    try {
      const res = await this.query(sql, values);
      return res; // Return all rows from the table
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
    const keys = Object.keys(filter);
    const values = Object.values(filter);
    const where = keys.map((key) => `${key} = ?`).join(' AND ');
    const set = Object.entries(update)
      .map(([key]) => `${key} = ?`)
      .join(', ');
    const sql = `UPDATE ${tableName} SET ${set} WHERE ${where}`;
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

  async count(tableName, { _ }) {
    const sql = `SELECT COUNT(*) AS ${tableName} FROM ${tableName}`;
    try {
      const res = await this.query(sql);
      return res[0][tableName];
    } catch (error) {
      logger.error('Error:', error);
      return null; // Return null if there's an error
    }
  }
}
