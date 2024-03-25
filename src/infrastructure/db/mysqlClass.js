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
    // Get a connection from the connection pool

    try {
      // Attempt to execute the SQL query using the acquired connection
      const [rows] = await connection.query(sql, values);
      // Execute the SQL query with provided values and retrieve the result rows

      return rows;
      // Return the result rows of the executed query
    } catch (error) {
      // If an error occurs during the execution of the SQL query
      logger.error('Error executing SQL query:', error);
      // Log the error message

      throw new Error('Error executing SQL query');
      // Throw a new error indicating the failure in executing the SQL query
    } finally {
      connection.release();
      // Release the acquired connection back to the connection pool
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
   ** Updates a record in the specified table based on the specified filter criteria.
   * @param {string} tableName - The name of the table to update a record in.
   * @param {{ input: { filter: Object, update: Object } }} data - The input data for the update operation.
   * @param {object} table - The table schema information.
   * @returns {Promise<{ updated: Array<Object> } | null>} - A promise that resolves to the updated record(s) or null if there was an error.
   */
  async update(tableName, { input }, table) {
    // UPDATE `table_name` SET `column_name` = `new_value' [WHERE condition];
    let updateQuery = `UPDATE ${tableName} SET `;
    let findQuery = `SELECT * FROM ${tableName} WHERE`;
    const values = [];
    const findValues = [];

    // Process the update values and conditions
    for (let [key, value] of Object.entries(input._update ?? {}).concat(Object.entries(input._upload ?? {}))) {
      if (key === 'url') {
        // Handle the 'url' key separately
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

        // Process the filter object and get the processed SQL and values
        const { processedSql, processedValues } = processFilter(filter);

        // remove trailing spaces and comma
        updateQuery = updateQuery.slice(0, -2);
        values.push(...processedValues);

        // update table set icon class = url where condition
        updateQuery += processedSql;
      } else {
        // Handle other keys and values
        console.log({ key });
        updateQuery += `${key} = ?, `;
        findQuery += ` ${key} = ? AND `;
        values.push(value);
        findValues.push(value);
      }
    }
    // Remove the last ',' and 'AND' from the queries
    findQuery = findQuery.slice(0, -5);
    try {
      // Execute the update query
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

  async count(tableName, { input }) {
    let sql = `SELECT COUNT(*) AS ${tableName} FROM ${tableName}`;

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

    try {
      const res = await this.query(sql, values);
      return res[0][tableName];
    } catch (error) {
      logger.error('Error:', error);
      return error; // this will return the error message and null
    }
  }

  /**
   * * Uploads a file to Amazon S3 and updates the specified table with the file URL.
   * @param {string} tableName - The name of the table to update with the file URL.
   * @param {{ input: { _upload: { file: object, filter: object } } }} data - The input data for the upload operation.
   * @param {object} table - The table schema information.
   * @returns {Promise<{ uploaded: string } | ApolloError>} - A promise that resolves to the uploaded file URL or an ApolloError if there was an error.
   */

  async upload(tableName, { input }, table) {
    console.log({ input });
    console.log(input._upload.file);
    // Check if a file object is provided in the input data, if not, throw an error
    const { file } = input._upload;
    console.log(typeof file);

    if (!file) {
      throw new Error('No file provided');
    }
    // Extract necessary information from the file object: filename, createReadStream, encoding
    const { filename, createReadStream } = await file;
    console.log(filename);

    // Check if the mimetype is valid (png, jpeg, jpg)
    const mimeTypes = {
      png: 'image/png',
      jpg: 'image/jpg',
      jpeg: 'image/jpeg',
    };

    /**
     ** Returns the mime type of a file based on its filename.
     * @param {string} filename - The filename of the file.
     * @returns {string} - The mime type of the file.
     */
    const getMimeType = (filename) => {
      const extension = filename.split('.').pop();
      return mimeTypes[extension.toLowerCase()];
    };

    // Create a read stream from the file data
    const stream = createReadStream();

    try {
      // Find the column with extra === 'key'
      const keyColumn = table.columns.find((column) => column.extra === 'key');

      if (!keyColumn) {
        throw new Error('No column with extra === "key" found in the table');
      }

      // Find the filter for the key column
      if (!input._upload.filter || Object.keys(input._upload.filter).length <= 0) {
        throw new Error('No filter provided');
      }

      // Create the S3 key for the uploaded file
      const key = `icarus/${tableName}/${filename}`;

      // Create an upload stream to S3
      const uploadStream = await createUploadStream(key, getMimeType(filename));

      // Pipe the file read stream to the upload stream
      stream.pipe(uploadStream.writeStream);

      // Wait for the upload to finish and get the S3 location
      const result = await uploadStream.promise;

      // Remove the file object from the input data
      //delete input._upload.file;

      // Add the S3 location to the input data
      const updatedInput = {
        input: {
          _upload: {
            url: result.Location,
            ...input._upload,
          },
        },
      };

      // Construct the update query
      const updateQuery = `UPDATE ${tableName} SET icon_label = ?`;
      const updateValues = [result.Location];

      // Execute the update query
      await this.query(updateQuery, updateValues);

      // Return the S3 location
      return { uploaded: result.Location };
    } catch (error) {
      // Log any errors and return an ApolloError
      logger.error(`[Error]: Message: ${error.message}, Stack: ${error.stack}`);
      throw new ApolloError('An error occurred during file upload', 'UPLOAD_ERROR');
    }
  }
}
