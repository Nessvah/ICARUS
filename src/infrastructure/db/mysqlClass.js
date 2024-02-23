/* eslint-disable no-prototype-builtins */
import { logger } from '../server.js';
export class MySQLConnection {
  constructor(currentTableInfo) {
    this.pool = currentTableInfo.pool;
    this.operatorsMap = {
      _eq: '=',
      _lt: '<',
      _lte: '<=',
      _gt: '>',
      _gte: '>=',
      _neq: '<>',
      _and: 'AND',
      _or: 'OR',
    };
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
    console.log(sql, '---', values);
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
    const columns = [];
    const whereConditions = [];
    let logicalOperator;

    //* Scenario 2: They can send a query with a filter option
    //* this includes having a skip/take or none
    // check if the filter options is present
    if (input.filter) {
      logger.warn('inside filter');
      const { filter } = input;

      logicalOperator = input.filter._or ? ' OR ' : ' AND ';
      logger.warn(logicalOperator);
      // check for the logical operators if present
      Object.keys(filter).forEach((key) => {
        // check for the logical operators
        if (key === '_and' || key === '_or') {
          // handle those operations
          filter[key].forEach((logOperator) => {
            // check for the values of that operation

            logger.warn(logOperator);
            Object.keys(logOperator).forEach((column) => {
              columns.push(column);
              const condition = logOperator[column];

              // todo: handle nested logical operations
              // recursive logic to handle nested structures

              // get the operator and value to process
              processFilterItem.call(this, column, condition, logicalOperator);
            });
          });
        }

        //* Scenario 3: They can send a query with a filter option but
        //* without specifing the logical condition so we assume and 'AND' operation
        processFilterItem.call(this, key, filter[key], logicalOperator);
      });
    }

    // If no logical operators are provided, return all rows from the table
    // or the input doesnt have the filter property

    if (input.hasOwnProperty('skip') || input.hasOwnProperty('take')) {
      logger.warn('inside skip and take');

      const take = input.hasOwnProperty('take') ? 'LIMIT ?' : '';
      const skip = input.hasOwnProperty('skip') ? ', ?' : '';

      if (take && skip) {
        console.log('both');
        // add limit and offeset to query and push the values to the array
        sql += ` ${take} ${skip}`;
        values.push(input.skip, input.take);
      } else if (skip) {
        // if they only provide the take and no skip we need to put limit
        // as a huge number otherwise it will not work and we need to specify offset
        sql += ` LIMIT 99999999999999 OFFSET ?`;
        values.push(input.skip);
      } else {
        sql += ` ${take}`;
        values.push(input.take);
      }
    }

    logger.warn(sql);
    try {
      const res = await this.query(sql, values);
      return res; // Return all rows from the table
    } catch (error) {
      console.error('Error:', error);
      return null; // Return null if there's an error
    }

    function processFilterItem(columnName, cond, logicalOp) {
      if (Array.isArray(cond)) {
        console.log('Array', cond);
        return;
      }

      Object.entries(cond).forEach((condition) => {
        console.log(condition);
        const [operator, value] = condition;

        // Check if the operator is supported
        //todo: try to see a fix without disabling rule
        // eslint-disable-next-line no-prototype-builtins
        if (!this.operatorsMap.hasOwnProperty(operator)) {
          throw new Error('Not supported operator');
        }

        // get the matching operator for this db
        const sqlOperator = this.operatorsMap[operator];
        const placeholder = '?';

        // construct the string for this operation with the parameterized value
        const conditionStr = `${columnName} ${sqlOperator} ${placeholder}`;

        console.log('---sql', conditionStr);
        whereConditions.push(conditionStr);

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(logicalOp)}` : '';
        sql += ` ${whereClause}`;
        // save the actual values in an array
        values.push(value);
      });
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
  0;
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
