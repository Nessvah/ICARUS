/* eslint-disable no-prototype-builtins */

import {
  buildSkipAndTakeClause,
  // fetchForeignKeyConstraints,
  fetchPrimaryKeyColumnName,
  processFilter,
} from '../../utils/sqlQueries.js';
import { logger } from '../server.js';
import { createUploadStream } from './s3.js';

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
      //console.log('Executing SQL query:', sql);
      //console.log('SQL query values:', values);
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

  /**
   * * Fetches rows from a specified table based on optional filtering and pagination options.
   *
   * @param {string} tableName - The name of the table to query.
   * @param {object} input - The input object containing filter and pagination options.
   *   @property {object} filter - An object containing filter conditions for the SQL WHERE clause.
   *   @property {number} skip - The number of rows to skip for pagination.
   *   @property {number} take - The maximum number of rows to return for pagination.
   *
   * @returns {Promise<Array<object>|null>} - A promise that resolves to an array of rows from the specified table,
   * or null if there's an error. The result is filtered and paginated based on the provided input.
   *
   * @throws {Error} - Throws an error if there's an issue executing the SQL query.
   */
  async find(tableName, { input }) {
    // start constructing the sql query
    let sql = `SELECT * FROM ${tableName}`;

    // array to save the values
    const values = [];

    // check if the filter options is present and if it is,
    // take all the nested information and construct a sql query to filter
    if (input.filter) {
      const { processedSql, processedValues } = processFilter(input);

      // append values from filters and the where sql string
      values.push(...processedValues);
      sql += processedSql;
    }

    // check if they have option for sorting
    if (input.sort) {
      let groupSql = ` ORDER BY`;

      for (const [key, value] of Object.entries(input.sort)) {
        groupSql += ` ${key} ${value}, `;
      }

      groupSql = groupSql.slice(0, -2);
      sql += groupSql;
    }

    // if in the input we have find and/or take in our filters, we need
    // to make pagination and construct the sql query

    if (input.skip || input.take) {
      const { paginationSql, paginationValues } = buildSkipAndTakeClause(input);

      sql += paginationSql;
      values.push(...paginationValues);
    }

    try {
      const res = await this.query(sql, values);
      return res; // Return all rows from the table
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
    let createQuery = `INSERT INTO ${tableName} (`;
    let valuesString = 'VALUES (';

    const values = [];

    // in this scenario we don't know what's the name for the pk,
    // so we need to fetch the schema information of the table to know the name
    const primaryKeyColumnName = await fetchPrimaryKeyColumnName.call(this, tableName);
    //const foreignKeyConstraints = await fetchForeignKeyConstraints.call(this, tableName);

    // Build the columns and values arrays for the INSERT query
    for (const [key, value] of Object.entries(input._create)) {
      if (key !== '_action') {
        createQuery += `${key}, `; // we eill need to remove trailing comma and spaces at the end
        valuesString += '?, ';
        values.push(value);
      }
    }

    // Remove the trailing comma and space from createQuery and valuesString
    createQuery = `${createQuery.slice(0, -2)}) `;
    valuesString = `${valuesString.slice(0, -2)})`;

    const finalQuery = createQuery + valuesString;

    try {
      const record = await this.query(finalQuery, values);
      // send the record created back to the backoffice
      // Get the ID of the inserted record
      const insertedId = record.insertId;

      // Fetch the inserted record from the database
      // now we can fetch the new record just created
      const selectQuery = `SELECT * FROM ${tableName} WHERE ${primaryKeyColumnName} = ?`;
      const newRecord = await this.query(selectQuery, [insertedId]);
      return { created: newRecord };
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
  async update(tableName, { input }, table) {
    // UPDATE `table_name` SET `column_name` = `new_value' [WHERE condition];
    let updateQuery = `UPDATE ${tableName} SET `;
    let findQuery = `SELECT * FROM ${tableName} WHERE`;
    const values = [];
    const findValues = [];

    // simple update without filtering
    for (let [key, value] of Object.entries(input._update ?? {}).concat(Object.entries(input._upload ?? {}))) {
      if (key === 'url') {
        const keyColumn = table.columns.find((column) => column.extra === 'key');
        if (!keyColumn) {
          throw new Error('No column with extra === "key" found in the table');
        }
        updateQuery += `${keyColumn.name} = ?  `;
        values.push(value);
        console.log(' qwerty' + updateQuery);
      } else if (key === 'filter') {
        // handle filtering in update
        // mimik object structure for the function to process filter
        const filter = {};
        filter[key] = value;
        console.log(JSON.stringify(filter));

        const { processedSql, processedValues } = processFilter(filter);

        // remove trailing spaces and comma
        updateQuery = updateQuery.slice(0, -2);
        values.push(...processedValues);
        // update table set icon class = url where condition

        updateQuery += processedSql;
      } else {
        console.log({ key });
        updateQuery += `${key} = ?, `;
        findQuery += ` ${key} = ? AND `;
        values.push(value);
        findValues.push(value);
      }
    }

    findQuery = findQuery.slice(0, -5);
    try {
      const record = await this.query(updateQuery, values);

      if (record.changedRows > 0) {
        // find the record updated
        const newRecord = await this.query(findQuery, findValues);
        return { updated: newRecord };
      }

      return { updated: [] };
    } catch (err) {
      logger.error(err);
      return err; // Return null if there's an error
    }
  }

  /**
   * * Deletes a record from the specified table based on the specified filter.
   * @param {string} tableName - The name of the table from which to delete a record.
   * @param {{ input: { filter: Object } }} data - The input data for the delete operation.
   * @returns {Promise<{ deleted: number } | null>} - A promise that resolves to the number of affected rows or null if there was an error.
   */
  async delete(tableName, { input }) {
    // start constructing the sql query
    const deleteObj = input._delete;

    // for now lets not let them delete everything
    if (Object.entries(deleteObj).length === 0) return new Error("Can't delete everything for now.");

    let sql = `DELETE FROM ${tableName}`;

    const values = [];
    // check if they are deleting with filter conditions
    if (deleteObj.filter) {
      const { processedSql, processedValues } = processFilter(deleteObj);

      // append values from filters and the where sql string
      values.push(...processedValues);
      sql += processedSql;
    }

    try {
      const res = await this.query(sql, values);
      return { deleted: res.affectedRows };
    } catch (error) {
      console.error('Error:', error);
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
      return error; // this will return the error message and null
    }
  }

  async upload(tableName, { input }, table) {
    console.log({ input });

    const { file } = input._upload;
    //const filter = this.filterController(_upload.filter);

    //console.log('File provided:', file ? 'Yes' : 'No');

    if (!file) {
      throw new Error('No file provided');
    }

    const { filename, createReadStream, encoding } = await file;
    //console.log('File details:', { filename, encoding });

    // Check if the mimetype is valid (png, jpeg, jpg)
    const mimeTypes = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
    };

    const getMimeType = (filename) => {
      const extension = filename.split('.').pop();
      return mimeTypes[extension.toLowerCase()];
    };

    const mimeType = getMimeType(filename);
    //console.log('Mime type:', mimeType);

    const stream = createReadStream();

    try {
      // Find the column with extra === 'key'
      const keyColumn = table.columns.find((column) => column.extra === 'key');

      if (!keyColumn) {
        throw new Error('No column with extra === "key" found in the table');
      }

      if (!input._upload.filter || Object.keys(input._upload.filter).length <= 0) {
        throw new Error('No filter provided or filter for the key column is missing');
      }

      const key = `icarus/${tableName}/${filename}`;
      const uploadStream = createUploadStream(key, mimeType);

      stream.pipe(uploadStream.writeStream);

      const result = await uploadStream.promise;
      //console.log('Upload result:', result);
      delete input._upload.file;

      const updatedInput = {
        input: {
          _upload: {
            url: result.Key,
            ...input._upload,
          },
        },
      };

      await this.update(tableName, updatedInput, table);

      //console.log('File uploaded successfully');
      return { uploaded: result.Location };
    } catch (error) {
      console.log(`[Error]: Message: ${error.message}, Stack: ${error.stack}`);
      throw new ApolloError('Error uploading file', 'UPLOAD_ERROR', {
        errorMessage: error.message,
      });
    }
  }
}
