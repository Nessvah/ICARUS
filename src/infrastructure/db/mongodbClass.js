import { ObjectId } from 'mongodb';
import { logger } from '../server.js';

//class that will control the table info and function that will be made in a mongodb database.
class MongoDBConnection {
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
    };
  }

  //connect to the database.
  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Error to connect to MongoDB:', error);
    }
  }

  //close the connection to the database.
  async close() {
    try {
      await this.client.close();
      logger.info('Connection closed.');
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
    }
  }

  //organize de filter in a mongodb filter structure, that will be use in the crud functions.
  // Convert GraphQL filter to MongoDB query
  filterController(input) {
    try {
      let query = {};

      // Iterate through filter fields
      Object.keys(input).forEach((fieldName) => {
        const filterValue = input[fieldName];

        // Handle nested operators _and and _or
        if (fieldName === '_and' || fieldName === '_or') {
          //console.log('nested filter');
          if (Array.isArray(filterValue)) {
            const operator = fieldName === '_and' ? '$and' : '$or';
            const nestedQueries = filterValue.map((nestedFilter) => this.filterController(nestedFilter));
            query[operator] = nestedQueries;
          }
        } else {
          // Handle comparison operators from ComparisonOperators input type
          const operator = fieldName.replace('_', '$');
          switch (fieldName) {
            case '_eq':
            case '_neq':
              // For String, Integer, Boolean, Double, Min/Max keys, Symbol, Date, ObjectID, Regular expression
              // Convert string to corresponding type if applicable
              if (typeof filterValue === 'string' && ObjectId.isValid(filterValue)) {
                query[operator] = ObjectId(filterValue);
              } else {
                query[operator] = filterValue;
              }

              break;
            case '_lt':
            case '_lte':
            case '_gt':
            case '_gte':
              // For Integer, Double, Date
              // Convert string to number if applicable
              query[operator] = !isNaN(filterValue) ? parseFloat(filterValue) : filterValue;
              break;
            case '_in':
            case '_nin':
              // For Arrays
              // Split the string and convert each element to the corresponding type if applicable
              query[operator] = filterValue.split(',').map((val) => val.trim());
              break;
            // Handle other comparison operators from ComparisonOperators input type...
            default:
              // Handle nested filters
              if (typeof filterValue === 'object') {
                const nestedQuery = this.filterController(filterValue);
                if (Object.keys(nestedQuery).length > 0) {
                  query[fieldName] = nestedQuery;
                }
              }
              break;
          }
        }
      });

      return query;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  //find a specific value or a array of values in a document, in a specific table. Return a array of objects fonded [{document}, {document}]
  // input:{filter: _id:["id", "id"]} or input:{filter:{keys and values}}
  async find(table, { input }) {
    try {
      const db = this.client.db(this.dbName);
      const collection = db.collection(table);
      let res;

      // Check if input.filter is empty or not defined
      if (!input.filter || input.filter === null || Object.keys(input.filter).length === 0) {
        // If input.filter is empty or not defined, return all documents
        return await collection.find().toArray();
      } else {
        // Call the filter function to reorganize the filter parameter
        const filter = input.filter._and ? this.filterController(input.filter) : input.filter;
        //console.log(JSON.stringify(filter, null, 2));

        if (filter) {
          const options = {
            // Set the timeout value in milliseconds
            maxTimeMS: 60000, // Adjust this value to your desired timeout
          };

          // Building query dynamically
          let query = collection.find(filter, options);

          // Add sort if client requests or let it default
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

          // Making the query with all parameters requested by client
          res = await query.toArray();
        }

        if (!res) {
          return false;
        }

        // Transform "_id" key into "id" key
        res.forEach((element) => {
          if (element._id) {
            const id = element._id;
            delete element._id;
            element.id = id;
          }
        });

        // Modify array fields to strings if necessary
        const isArrayField = this.tableData.columns.filter((column) => column.type === 'array');

        if (isArrayField.length > 0) {
          res.map((element) => {
            isArrayField.forEach((arrayField) => {
              const fieldName = arrayField.name;
              element[fieldName] = JSON.stringify(element[arrayField.name]);
            });
            return element;
          });
        }
        return res;
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
  //insert a new document or a array of new documents, in a specific table. Return a array of objects [{document}, {document}]
  //input:{create:[{keys and values}, {keys and values}]}
  async create(table, { input }) {
    try {
      const db = this.client.db(this.dbName);
      //insert the input to the table
      const collection = db.collection(table);

      const res = await collection.insertMany([input._create]);
      console.log({ res });
      if (!res) {
        return false;
      }
      // this transform the "_id" key in a "id" key, to follow the schema graphql definition, that have to be equal to all databases.
      [input._create].forEach((element) => {
        console.log({ element });
        if (element._id) {
          const id = element._id;
          delete element._id;
          element.id = id;
        }
      });

      return { created: [input._create] };
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  //update a document or a array of documents in a specific table. Return a array of objects [{document}, {document}]
  //the input have two variables {filter:{}, update:{}}, filter will be a object, and will be use to find the documents to be updated,
  //and update will be a object with the new document values.
  async update(table, { input }) {
    try {
      const db = this.client.db(this.dbName);
      const collection = db.collection(table);

      // Extract the update and filter from the input
      const { _update } = input;
      const filter = this.filterController(_update.filter);

      //edit the original document, with the input.

      const res = await collection.updateMany(filter, { $set: _update });
      console.log({ res });
      if (!res) {
        return false;
      }
      //find all the files that match the updated parameter.
      const updated = await collection.find(_update).toArray();
      if (!updated) {
        return false;
      }
      // this transform the "_id" key in a "id" key, to follow the schema graphql definition, that have to be equal to all databases.
      updated.forEach((element) => {
        console.log({ element });
        if (element._id) {
          const id = element._id;
          delete element._id;
          element.id = id;
        }
      });
      return { updated: updated };
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  //delete one or more documents by any value passed in a filter.
  //will not accept empty filter to prevent delete all the database.
  //return a Count of deleted documents
  async delete(table, { input }) {
    try {
      //input have to be a object if {id:[array of string ids] or filter: {object values}}
      const db = this.client.db(this.dbName);
      const collection = db.collection(table);

      const { _delete } = input;
      const filter = this.filterController(_delete.filter);

      //verify if filter have any kay values to filter and made the delete, to avoid delete all the database by mistake.
      if (Object.keys(filter).length <= 0) {
        return false;
      }
      const res = await collection.deleteMany(filter);

      if (!res) {
        return false;
      }
      //return a count of all files deleted.
      return { deleted: res.deletedCount };
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  async count(table, { _ }) {
    try {
      const db = this.client.db(this.dbName);
      const collection = db.collection(table);

      return await collection.countDocuments({});
    } catch (error) {
      logger.error(error);
      return [];
    }
  }

  // Changing "ASC"/"DESC" for "1"/"-1"
  sort(input) {
    if (input.sort) {
      const { sort } = input;
      const sortOptions = {};
      for (const key in sort) {
        if (sort[key] === 'ASC') sortOptions[key] = 1; //ASC
        else if (sort[key] === 'DESC') sortOptions[key] = -1; //DESC
      }
      return sortOptions;
    }
    return {};
  }
}

export { MongoDBConnection };
