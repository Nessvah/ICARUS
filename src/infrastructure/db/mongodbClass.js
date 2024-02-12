import { ObjectId } from 'mongodb';
import { logger } from '../server.js';
//class that will control the database that the user are accessing and transport
//the functions that will be use in the Resolvers file.

class MongoDBConnection {
  constructor(currentTableInfo) {
    this.tableData = currentTableInfo;
    this.dbName = currentTableInfo.databaseName; //save the database name
    this.client = currentTableInfo.pool; //create a mongoClient connection, passing the url.
    //this.tablesNames = data.map((table) => table.name); //save the tables name.
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

  //find a specific value in a document, in a specific table. Return a array of objects [{document}, {document}]
  //here the input have a "id" to find a specific document or the attributes used to filter the database for many documents.
  // input:{filter: _id:["id", "id"]} ou input:{filter:{keys and values}}
  async find(table, { input }) {
    const db = this.client.db(this.dbName);
    const collection = db.collection(table);
    let res;

    const query = this.filterController(input);

    if (query) {
      res = await collection.find(query).toArray();
    }
    if (!res) {
      return false;
    }
    res.forEach((element) => {
      if (element._id) {
        const id = element._id;
        delete element._id;
        element.id = id;
      }
    });

    return res;
  }

  //insert a new document(input) in a specific table. Return a objects {document}
  //here the input just have the attributes to be added to the table.
  //input:[{keys and values},{keys and values}]
  async create(table, { input }) {
    const db = this.client.db(this.dbName);
    //insert the input to the table
    const collection = db.collection(table);
    const res = await collection.insertMany(input.create);
    if (!res) {
      return false;
    }
    input.create.forEach((element) => {
      if (element._id) {
        const id = element._id;
        delete element._id;
        element.id = id;
      }
    });

    return { created: input.create };
  }

  //insert a new document(input) in a specific table. Return a object {document}
  // the input have two variables {filter:{}, update:{}}, and filter can have a "id" key that will be a array of strings {filter:{id:["id", "id"]}}
  async update(table, { input }) {
    const db = this.client.db(this.dbName);
    const filter = this.filterController(input);
    const { update } = input;

    //edit the original document, with the input.
    const collection = db.collection(table);

    const res = await collection.updateMany(filter, { $set: update });
    if (!res) {
      return false;
    }
    const updated = await collection.find(filter).toArray();
    if (!updated) {
      return false;
    }

    updated.forEach((element) => {
      if (element._id) {
        const id = element._id;
        delete element._id;
        element.id = id;
      }
    });
    return { updated: updated };
  }

  //delete one document by id.
  // the input variable is a {id:[ids]} or a {filter:{keys and values}}
  async delete(table, { input }) {
    //input have to be a object if {id:[array of string ids] or filter: {object values}}
    const db = this.client.db(this.dbName);
    const collection = db.collection(table);
    const filter = this.filterController(input);
    if (Object.keys(filter).length) {
      return false;
    }
    const res = await collection.deleteMany(filter);

    if (!res) {
      return false;
    }
    return { deleted: res.deletedCount };
  }
}

export { MongoDBConnection };

//mongodb+srv://icarus-user:veryGoodPassword@cluster0.hxbgjxm.mongodb.net/
