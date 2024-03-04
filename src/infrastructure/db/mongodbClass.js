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
    await this.client.close();
    logger.info('Connection closed.');
  }

  //organize de filter in a mongodb filter structure, that will be use in the crud functions.
  filterController(input) {
    let query = {};
    this.tableData.columns.forEach((colum) => {
      if (input.filter) {
        if (input.filter[colum.name]) {
          if (colum.name == 'id') {
            let idArray = [];
            input.filter.id.forEach((id) => idArray.push(new ObjectId(id)));
            query._id = { $in: idArray };
          } else {
            query[colum.name] = { $in: input.filter[colum.name] };
          }
        }
      }
    });
    return query;
  }

  //find a specific value or a array of values in a document, in a specific table. Return a array of objects fonded [{document}, {document}]
  // input:{filter: _id:["id", "id"]} or input:{filter:{keys and values}}
  async find(table, { input }) {
    const db = this.client.db(this.dbName);
    //console.log(table, input);
    const collection = db.collection(table);

    //call the filter function to reorganize que filter parameter to a more readable one.
    const filter = this.filterController(input);

    if (filter) {
      const options = {};

      // Set the timeout value in milliseconds
      const timeoutMilliseconds = 60000; // Adjust this value to your desired timeout

      // Set the maxTimeMS option
      options.maxTimeMS = timeoutMilliseconds;

      // Buildind query dinamically
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
    // this transform the "_id" key in a "id" key, to follow the schema graphql definition, that have to be equal to all databases.
    res.forEach((element) => {
      if (element._id) {
        const id = element._id;
        delete element._id;
        element.id = id;
      }
      console.log({ mongoQuery });
    });

    // To verify if there is array in any column of the table
    const isArrayField = this.tableData.columns.filter((column) => column.type === 'array');

    // To modify the array field to string
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

  //insert a new document or a array of new documents, in a specific table. Return a array of objects [{document}, {document}]
  //input:{create:[{keys and values}, {keys and values}]}
  async create(table, { input }) {
    const db = this.client.db(this.dbName);
    //insert the input to the table
    const collection = db.collection(table);
    const res = await collection.insertMany(input.create);
    if (!res) {
      return false;
    }
    // this transform the "_id" key in a "id" key, to follow the schema graphql definition, that have to be equal to all databases.
    input.create.forEach((element) => {
      if (element._id) {
        const id = element._id;
        delete element._id;
        element.id = id;
      }
    });

    return { created: input.create };
  }

  //update a document or a array of documents in a specific table. Return a array of objects [{document}, {document}]
  //the input have two variables {filter:{}, update:{}}, filter will be a object, and will be use to find the documents to be updated,
  //and update will be a object with the new document values.
  async update(table, { input }) {
    const db = this.client.db(this.dbName);
    //call the filter function to reorganize que filter parameter to a more readable one.
    const filter = this.filterController(input);
    const { update } = input;

    //edit the original document, with the input.
    const collection = db.collection(table);

    const res = await collection.updateMany(filter, { $set: update });
    if (!res) {
      return false;
    }
    //find all the files that match the updated parameter.
    const updated = await collection.find(update).toArray();
    if (!updated) {
      return false;
    }
    // this transform the "_id" key in a "id" key, to follow the schema graphql definition, that have to be equal to all databases.
    updated.forEach((element) => {
      if (element._id) {
        const id = element._id;
        delete element._id;
        element.id = id;
      }
    });
    return { updated: updated };
  }

  //delete one or more documents by any value passed in a filter.
  //will not accept empty filter to prevent delete all the database.
  //return a Count of deleted documents
  async delete(table, { input }) {
    //input have to be a object if {id:[array of string ids] or filter: {object values}}
    const db = this.client.db(this.dbName);
    const collection = db.collection(table);
    const filter = this.filterController(input);
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
      for (let key in sort) {
        if (sort[key] === 'ASC') sortOptions[key] = 1; //ASC
        else if (sort[key] === 'DESC') sortOptions[key] = -1; //DESC
      }
      return sortOptions;
    }
    return {};
  }
}

export { MongoDBConnection };
