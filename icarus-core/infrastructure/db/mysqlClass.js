/* eslint-disable no-prototype-builtins */

import {
  buildSkipAndTakeClause,
  // fetchForeignKeyConstraints,
  fetchPrimaryKeyColumnName,
  processFilter,
} from '../../utils/sqlQueries.js';
import { logger } from '../server.js';
import { createUploadStream } from './s3.js';
import { getMimeType, hasNestedObjects } from '../../utils/fileUtils.js';
import { IMAGES_TYPES } from '../../utils/enums/enums.js';

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
  async update(tableName, { input }) {
    // UPDATE table_name SET column_name = `new_value' [WHERE condition];
    let updateQuery = `UPDATE ${tableName} SET `;
    let findQuery = `SELECT * FROM ${tableName} WHERE `;
    const values = [];
    const findValues = [];

    // simple update without filtering
    for (const [key, value] of Object.entries(input.update)) {
      if (key === 'filter') {
        // handle filtering in update
        // mimic object structure for the function to process filter
        const filter = {};
        filter[key] = value;

        const { processedSql, processedValues } = processFilter(filter);

        // remove trailing spaces and comma
        updateQuery = updateQuery.slice(0, -2);
        values.push(...processedValues);

        updateQuery += processedSql;
      } else {
        updateQuery += `${key} = ?, `;
        findQuery += `${key} = ? AND `;
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
   * @returns {string} - A promise that resolves to the uploaded file URL or an ApolloError if there was an error.
   */
  async upload(tableName, { input }, table) {
    console.log(JSON.stringify(input));
    // Get all the necessary data
    const filter = input._upload?.filter;
    const file = input._upload?.file;
    const location = input._upload.location.toLowerCase();

    // check if we have any missing data from the user
    //! { filter: { _and: null }, -> this will pass the error for empty filter
    // we need a more granular control on what it's being passed on the nested obj
    if (!hasNestedObjects(filter)) return { uploaded: { data: 'Filter is mandatory for uploading files' } };

    if (!file) return { uploaded: { data: 'You need to provide a file' } };

    // Extract necessary information from the file object: filename, createReadStream, encoding
    const { filename, createReadStream } = await file.file;

    if (location === 's3') {
      try {
        // Check if the mimetype is valid (png, jpeg, jpg)
        const mimeType = getMimeType(filename, IMAGES_TYPES);

        // Find the column with extra === 'key'
        const keyColumn = table.columns.find((column) => column.extra === 'key');

        if (!keyColumn) return { uploaded: { data: 'No column with extra === "key" found in the table' } };

        // Create the S3 key for the uploaded file
        const key = `${tableName}/${filename}`;

        // Create a read stream from the file data
        const stream = createReadStream();
        let uploadStream = undefined;
        if (stream) {
          // Create an upload stream to S3
          uploadStream = await createUploadStream(key, mimeType);

          // check if upload stream and write stream are defined before piping
          if (uploadStream && (await uploadStream.writeStream)) {
            // Pipe the file read stream to the upload stream
            stream.pipe(uploadStream.writeStream);
          } else
            return {
              uploaded: { data: 'Server Error: Upload stream or its writeStream is undefined' },
            };
        } else
          return {
            uploaded: { data: 'Server Error: Stream is undefined' },
          };

        // Wait for the upload to finish and get the S3 location
        const result = await uploadStream.promise;

        // Remove the file object from the input data and the location so it doesn't mess it up on
        // the processFilter logic
        delete input._upload.file;
        delete input._upload.location;
        // Add the S3 location to the input data
        input._upload = {
          url: result.Location,
          ...input._upload,
        };

        // Construct the update query
        let updateQuery = `UPDATE ${tableName} SET ${keyColumn.name} = ? `;
        const updateValues = [result.Location];

        for (const [key, value] of Object.entries(input._upload)) {
          if (key === 'filter') {
            // handle filtering in update
            // mimic object structure for the function to process filter
            const filter = {};
            filter[key] = value;

            const { processedSql, processedValues } = processFilter(filter);

            // remove trailing spaces and comma
            updateQuery += processedSql;
            updateValues.push(...processedValues);
          } else continue;

          // Execute the update query
          const updateResults = await this.query(updateQuery, updateValues);
          // Return the S3 location
          return { uploaded: { changedRows: updateResults.changedRows, data: result.Location } };
        }
      } catch (error) {
        // Log any errors and return an ApolloError
        logger.error(`[Error]: Message: ${error.message}, Stack: ${error.stack}`);
        return { uploaded: { data: error.message } };
      }
    } else if (location === 'fs') {
      //Apply the upload to filesystem logic
    }
  }
}
