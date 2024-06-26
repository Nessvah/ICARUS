import { ObjectId } from 'mongodb';
import { logger } from '../server.js';
import { afterResolver } from '../../utils/hooks/afterResolver/afterResolver.js';
import { createUploadStream } from './s3.js';

/**
 ** MongoDBConnection class handles connections and operations with MongoDB.
 */
export class MongoDBConnection {
  /**
   ** Constructor for MongoDBConnection class.
   * @param {object} currentTableInfo - Information about the current table.
   * @param {string} currentTableInfo.table - Name of the table.
   * @param {string} currentTableInfo.type - Database type.
   * @param {string} currentTableInfo.databaseName - Name of the database.
   * @param {object} currentTableInfo.columns - Structure of the table.
   * @param {object} currentTableInfo.pool - Connection pool to the database.
   */
  constructor(currentTableInfo) {
    this.tableData = currentTableInfo; //  {table: table Name, type: database type, databaseName: database name, columns: table structure, pool: connection to the database}
    this.dbName = currentTableInfo.databaseName; //save the database name.
    this.client = currentTableInfo.pool; //the poll connection to the current database.
    this.operatorsMap = {
      _eq: '$eq',
      _lt: '$lt',
      _lte: '$lte',
      _gt: '$gt',
      _gte: '$gte',
      _neq: '$ne',
      _and: '$and',
      _or: '$or',
      _in: '$in',
      _nin: '$nin',
      _like: '$regex',
    };
  }

  /**
   ** Establishes connection to the MongoDB database.
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Error to connect to MongoDB:', error);
    }
  }

  /**
   ** Closes the connection to the MongoDB database.
   * @returns {Promise<void>}
   */ async close() {
    try {
      await this.client.close();
      logger.info('Connection closed.');
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
    }
  }

  /**
   ** Convert GraphQL filter to MongoDB query
   * @param {object} input
   * @returns {object}
   */
  filterController(input) {
    // Function to convert GraphQL filter to MongoDB query
    try {
      // Initialize an empty object to store the MongoDB query
      let query = {};

      // Iterate through filter fields
      Object.keys(input).forEach((fieldName) => {
        const filterValue = input[fieldName];

        //* Handle nested operators _and and _or
        /* The code iterates through the input object, which contains the filter fields,
        and handles nested operators such as _and and _or. 
        It uses the operatorsMap object to map the filter fields to MongoDB operators */
        if (fieldName === '_and') {
          if (Array.isArray(filterValue)) {
            const operator = this.operatorsMap[fieldName] || '$' + fieldName;
            const nestedQueries = filterValue.map((nestedFilter) => this.filterController(nestedFilter));

            query[operator] = nestedQueries;
          }
        } else if (fieldName === '_or') {
          if (Array.isArray(filterValue)) {
            const operator = this.operatorsMap[fieldName] || '$' + fieldName;
            const nestedQueries = filterValue.map((nestedFilter) => this.filterController(nestedFilter));

            query[operator] = nestedQueries;
          }
        } else {
          // Handle comparison operators from ComparisonOperators input type
          const operator = this.operatorsMap[fieldName] || fieldName;
          switch (fieldName) {
            /* For comparison operators such as _eq, _lt, _lte, _gt, _gte, _neq, 
            the code checks if the filter value is a string and if it is a valid ObjectID, 
            it converts it to an ObjectID. It then sets the MongoDB operator to 
            $eq, $lt, $lte, $gt, $gte, or $ne, depending on the filter field. */
            case '_eq':
            case '_neq':
              // For String, Integer, Boolean, Double, Min/Max keys, Symbol, Date, ObjectID, Regular expression
              // Convert string to corresponding type if applicable
              if (typeof filterValue === 'string' && ObjectId.isValid(filterValue)) {
                query[operator] = new ObjectId(filterValue);
              } else {
                query[operator] = filterValue;
              }

              break;
            case '_lt':
            case '_lte':
            case '_gt':
            case '_gte':
              // For less than, less than or equal to, greater than, greater than or equal to
              // handle as usual
              query[operator] = filterValue;
              break;
            /* For comparison operators such as _like, the code sets the MongoDB operator to 
            $regex and constructs a regular expression pattern for case-insensitive substring 
            matching. */
            case '_like':
              // For case-insensitive substring match using regular expression
              const regexPattern = `.*${filterValue}.*`;
              query = { $regex: regexPattern, $options: 'i' };
              break;
            /* For comparison operators such as _in and _nin, the code sets the MongoDB operator 
            to $in or $nin and converts the filter value to an array. */
            case '_in':
            case '_nin':
              // For inclusion and exclusion in an array, handle as usual
              query[operator] = filterValue.split(',').map((val) => val.trim());
              break;
            // Handle other comparison operators from ComparisonOperators input type...
            default:
              //* Handle nested filters
              /* The code handles nested filters by calling the filterController function again 
              with the nested filter value. If the nested filter results in a non-empty object, 
              it sets the MongoDB operator to _id for the _id field or to the field name for other fields. */
              if (typeof filterValue === 'object') {
                // If filterValue is an object, recursively call filterController for nested filters
                const nestedQuery = this.filterController(filterValue);
                if (Object.keys(nestedQuery).length > 0) {
                  if (fieldName === 'id') {
                    query._id = nestedQuery; // Set _id field
                  } else {
                    query[fieldName] = nestedQuery; // Set field name
                  }
                }
              }
              break;
          }
        }
      });
      // returns the resulting MongoDB query.
      return query;
    } catch (error) {
      logger.error(error); // Log any errors
      return {}; // Return an empty object in case of errors
    }
  }

  /**
   ** find a specific value or a array of values in a document, in a specific table.
   * @param {string} tableName
   * @param {object} input
   * @param {object} input.filter
   * @param {object} input.sort
   * @param {number} input.skip
   * @param {number} input.take
   * @returns {Promise<object[]>}
   */
  async find(tableName, { input }) {
    try {
      // Retrieve the database object from the MongoDB client
      const db = this.client.db(this.dbName);
      // Retrieve the collection object
      const collection = db.collection(tableName);
      let res;
      let query;
      console.log('chegueeiiii');
      //* Check if input.filter is empty or not defined
      /* Retrieve the database and collection objects from the MongoDB client. 
      Then, it determines whether the input contains a filter or not. If the filter is empty, 
      it returns all the documents in the collection. 
      Otherwise, it reorganizes the filter parameter using the filterController function. */
      if (!input.filter || input.filter === null || Object.keys(input.filter).length === 0) {
        query = collection.find();
      } else {
        // Call the filter function to reorganize the filter parameter
        const filter = input.filter._and || input.filter._or ? this.filterController(input.filter) : input.filter;
        const options = {
          // Set the timeout value in milliseconds
          maxTimeMS: 60000, // Adjust this value to your desired timeout
        };
        query = collection.find(filter, options).maxTimeMS(options.maxTimeMS);
      }

      //* Add sort if client requests or let it default
      /* Add sorting and pagination to the query, if requested by the client. 
      Use the sort and sortController functions to sort the documents and the skip and limit functions to paginate the results. */
      if (input.sort) {
        query = query.sort(this.sort(input));
      } else {
        query = query.sort({ _id: 1 }); // Ordenação padrão se não for especificada
      }

      // Add skip if client requests
      if (input.skip) {
        query = query.skip(input.skip);
      }

      // Add limit if client requests
      if (input.take) {
        query = query.limit(input.take);
      }

      // Call the toArray function to retrieve the results as an array
      res = await query.toArray();

      // Transform the "_id" key into an "id" key, to match the schema defined in the GraphQL schema
      const processedRes = afterResolver(res, this.tableData.type);

      // Return the processed results
      return processedRes;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   ** insert a new document or a array of new documents, in a specific table.
   * @param {string} tableName
   * @param {object} input
   * @param {object[]} input._create
   * @returns {Promise<object[]>}
   */
  async create(tableName, { input }, table) {
    try {
      // Retrieve the database object from the MongoDB client
      const db = this.client.db(this.dbName);
      // Retrieve the collection object
      const collection = db.collection(tableName);

      // TODO: Refactor this!
      // check if it's trying to create an user
      if (input._create.role_name) {
        const { role_name } = input._create;

        // get the info from the column that will have the foreign entity info
        const foreignColumn = table.columns.find((column) => column.foreignEntity);

        const role = role_name.toLowerCase();
        const roleCollection = db.collection(foreignColumn.foreignEntity);
        try {
          const filter = { role_name: role };
          // get the specified role info
          const roleInfo = await roleCollection.findOne(filter);
          console.log({ roleInfo });
          input._create.role_id = roleInfo._id;
        } catch (ee) {
          throw new Error(ee);
        }
      }

      // Insert the data into the collection
      const res = await collection.insertMany([input._create]);

      // Check if the operation is successful
      if (!res) {
        return false; // Return false if the operation fails
      }

      // Transform the "_id" key into an "id" key, to match the schema defined in the GraphQL schema
      // Iterate over each element in the input._create array
      const processedRes = afterResolver([input._create], this.tableData.type);

      // Return an object with the created property, containing the inserted data
      return { created: processedRes };
    } catch (error) {
      logger.error(error); // Log any errors
      return false; // Return false in case of any errors
    }
  }

  /**
   ** Update one or more documents in a specific table or upgrade them.
   * @param {string} tableName - The name of the table to update documents in.
   * @param {object} input - An object containing update information.
   * @param {object} input._update - An object specifying the update operation.
   * @param {object} input._update.filter - The filter criteria to match documents for update.
   * @param {object} input._upgrade - An object specifying the upgrade operation.
   * @param {object} input._upgrade.filter - The filter criteria to match documents for upgrade.
   * @returns {Promise<object[]>} - A promise resolving to an array of updated documents.
   */

  async update(tableName, { input }) {
    try {
      // Retrieve the database object from the MongoDB client
      const db = this.client.db(this.dbName);
      // Retrieve the collection object
      const collection = db.collection(tableName);

      if (input._update) {
        // Construct a filter object using the filterController method
        const filter = this.filterController(input._update.filter);

        // Call updateMany method to update matching documents in the collection
        delete input._update.filter;
        const res = await collection.updateMany(filter, { $set: input._update });
        if (!res) {
          return false; // Return false if the operation fails
        }

        // Find all documents that match the updated parameter
        const updated = await collection.find(input._update).toArray();
        if (!updated) {
          return false; // Return false if no documents are found
        }
        // Transform the "_id" key into an "id" key, to match the schema defined in the GraphQL schema
        const processedRes = await afterResolver(updated, this.tableData.type);

        // Return an object with the updated property containing the updated documents
        return { updated: processedRes };
      } else if (input._upload) {
        // Extract the filter from the input
        const filter = this.filterController(input._upload.filter);
        console.log(filter);
        // Call updateMany method to update matching documents in the collection
        delete input._upload.filter;
        const res = await collection.updateMany(filter, { $set: input._upload });
        if (!res) {
          return false; // Return false if the operation fails
        }
        // Find all documents that match the updated parameter
        const updated = await collection.find(input._upload).toArray();
        if (!updated) {
          return false; // Return false if no documents are found
        }
        // Transform the "_id" key into an "id" key, to match the schema defined in the GraphQL schema
        const processedRes = await afterResolver(updated, this.tableData.type);

        // Return an object with the updated property containing the updated documents
        return { updated: processedRes };
      } else {
        return false; // Return false if neither _update nor _upload is provided
      }
    } catch (error) {
      logger.error(error); // Log any errors
      return false; // Return false in case of any errors
    }
  }

  /**
   ** Deletes documents from a specified collection in the MongoDB database.
   * @param {string} table - The name of the collection to delete documents from.
   * @param {object} input - The input object containing the filter criteria for deletion.
   * @param {object} input._delete - The delete criteria object.
   * @param {object} input._delete.filter - The filter criteria to select documents for deletion.
   * @returns {Promise<{ deleted: number }|boolean>} - A promise that resolves to an object with the count of deleted documents, or false if deletion fails.
   */
  async delete(tableName, { input }) {
    try {
      // Retrieve the database object from the MongoDB client
      const db = this.client.db(this.dbName);
      // Retrieve the collection object
      const collection = db.collection(tableName);

      // Extract the delete criteria from the input
      const { _delete } = input;
      // Construct a filter object using the filterController function
      const filter = this.filterController(_delete.filter);

      // Verify if the filter object contains any key-value pairs
      // If the filter is empty, return false to indicate no documents were deleted
      if (Object.keys(filter).length <= 0) {
        return false;
      }
      // Call deleteMany method to delete documents matching the filter criteria
      const res = await collection.deleteMany(filter);
      if (!res) {
        return false; // Return false if the operation fails
      }
      // Return an object with the deleted property containing the count of deleted documents
      return { deleted: res.deletedCount };
    } catch (error) {
      logger.error(error); // Log any errors
      return false; // Return false in case of any errors
    }
  }

  /**
   ** Counts the number of documents in a collection.
   * @param {string} tableName - The name of the collection.
   * @param {object} options - Additional options.
   * @returns {Promise<number>} - The count of documents in the collection.
   */
  async count(tableName, { input }) {
    try {
      // Retrieve the database object from the MongoDB client
      const db = this.client.db(this.dbName);
      // Retrieve the collection object
      const collection = db.collection(tableName);
      let res;

      //* Check if input.filter is empty or not defined
      /* Retrieve the database and collection objects from the MongoDB client. 
      Then, it determines whether the input contains a filter or not. If the filter is empty, 
      it returns all the documents in the collection. 
      Otherwise, it reorganizes the filter parameter using the filterController function. */
      if (!input.filter || Object.keys(input.filter).length === 0) {
        //! cursor.count is deprecated and will be removed in the next major version
        // If no filter is provided, use countDocuments() to count all documents
        res = await collection.countDocuments();
      } else {
        // Call the filter function to reorganize the filter parameter
        const filter = input.filter._and || input.filter._or ? this.filterController(input.filter) : input.filter;

        const options = {
          // Set the timeout value in milliseconds
          maxTimeMS: 60000, // Adjust this value to your desired timeout
        };
        res = await collection.countDocuments(filter, options);
      }

      return res;
    } catch (error) {
      logger.error(error); // Log any errors
      return []; // Return an empty array in case of any errors
    }
  }

  /**
   ** Sorts the input object based on the provided sort options. "ASC"/"DESC"
   * @param {Object} input - The input object.
   * @param {Object} input.sort - The sort options.
   * @returns {Object} - The sorted options.
   */
  sort(input) {
    // Check if the input object contains a sort property
    if (input.sort) {
      // If it does, extract the sort object from the input
      const { sort } = input;
      // Initialize an empty object to store the sort options
      const sortOptions = {};
      // Iterate through the sort object
      for (const key in sort) {
        // Set the sort options for each key based on the value of the sort property
        if (sort[key] === 'ASC') sortOptions[key] = 1; //ASC
        else if (sort[key] === 'DESC') sortOptions[key] = -1; //DESC
      }
      // Return the sort options object
      return sortOptions;
    }
    // If the input object does not contain a sort property, return an empty object
    // This means that the documents will be sorted based on the _id field in ascending order by default
    return {};
  }

  /**
   ** Uploads a file to S3 and updates the database with the uploaded file's location.
   *
   * @param {string} tableName - The name of the table that the file is being uploaded to.
   * @param {object} input - The input object containing the file and filter criteria.
   * @param {object} input._upload - The upload criteria object.
   * @param {object} input._upload.file - The file to be uploaded.
   * @param {object} input._upload.filter - The filter criteria to select the rows to be updated.
   * @param {object} table - The table structure, used to determine the column with the "key" extra.
   * @returns {Promise<{uploaded: {changedRows: *, data: *}}>} - A promise that resolves to an object with the uploaded file's location, or an ApolloError if the upload fails.
   */
  async upload(tableName, { input }, table) {
    const { file } = input._upload.file;
    const { _upload } = input;
    const location = _upload.location.toLowerCase();
    const filter = this.filterController(_upload.filter);

    if (!file) {
      throw new Error('No file provided');
    }

    const { filename, createReadStream } = await file;
    if (location === 's3') {
      try {
        // Check if the mimetype is valid (png, jpeg, jpg)
        const mimeTypes = {
          png: 'image/png',
          jpg: 'image/jpg',
          jpeg: 'image/jpeg',
        };

        const getMimeType = (filename) => {
          const extension = filename.split('.').pop();
          return mimeTypes[extension.toLowerCase()];
        };
        /**
         ** Returns the mime type of a file based on its filename.
         * @param {string} filename - The filename of the file.
         * @returns {string} - The mime type of the file.
         */
        const mimeType = getMimeType(filename);

        const stream = createReadStream();

        // Find the column with extra === 'key'
        const keyColumn = table.columns.find((column) => column.extra === 'key');

        if (!keyColumn) {
          throw new Error('No column with extra === "key" found in the table');
        }

        // Ensure a filter is provided
        if (!filter || Object.keys(filter).length <= 0) {
          throw new Error('No filter provided');
        }

        // Create the S3 key for the uploaded file
        const key = `${tableName}/${filename}`;

        // Create an upload stream to S3
        const uploadStream = await createUploadStream(key, mimeType);

        // Pipe the file read stream to the upload stream
        stream.pipe(uploadStream.writeStream);

        // Wait for the upload to finish and get the S3 location
        const result = await uploadStream.promise;

        // Remove the file object from the input data
        delete input._upload.file;
        delete input._upload.location;

        // Add the S3 location to the input data
        const updatedInput = {
          input: {
            _upload: {
              fileUrl: result.Location,
              ...input._upload,
            },
          },
        };

        console.log({ updatedInput });

        // Update the database table with the new input data
        const updateResults = await this.update(tableName, updatedInput);

        // Return the S3 location
        return { uploaded: { changedRows: updateResults.changedRows, data: result.Location } };
      } catch (error) {
        logger.error(`[Error]: Message: ${error.message}, Stack: ${error.stack}`);
        return { uploaded: { data: error.message } };
      }
    } else if (location === 'fs') {
      //Apply the upload to filesystem logic
    }
  }
}
