import { logger } from '../server.js';
import { afterResolver } from '../../utils/hooks/afterResolver/afterResolver.js';
import { finished } from 'stream/promises';
import fs from 'fs';
/**
 ** fileSystemClass class handles operations with local server files.
 */
export class FileSystemClass {
  constructor(currentTableInfo) {
    this.table = currentTableInfo.table;
    this.type = currentTableInfo.type;
    this.columns = currentTableInfo.columns;
    this.directory = currentTableInfo.directory;
    this.host = currentTableInfo.host;
  }

  async find(tableName, { input }) {
    let folderPath = `./${this.directory}/`;

    if (input.folder) {
      folderPath = folderPath + `${input.folder}/`;
      if (input.filter?.name) {
        folderPath = folderPath + input.filter.name;
        if (fs.existsSync(folderPath)) {
          const url = this.host + '/' + this.directory + '/' + tableName + '/' + input.filter.name;
          return [url];
        } else {
          throw new Error('file does not exists');
        }
      } else {
        return fs.readdirSync(folderPath);
      }
    }

    const folders = fs.readdirSync(folderPath);
    let result;
    if (input.filter?.name) {
      result = folders.map((folder) => {
        folderPath = folderPath + `${folder}/` + input.filter.name;
        if (fs.existsSync(folderPath)) {
          const url = this.host + '/' + this.directory + '/' + tableName + '/' + input.filter.name;
          return url;
        }
      });
    } else {
      result = folders.map((folder) => {
        folderPath = folderPath + `${folder}`;
        return fs.readdirSync(folderPath);
      });
      result = result.flat();
    }
    return result;
  }

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

  async delete(tableName, { input }) {
    try {
      const { folder, filter } = input;
      let folderPath = `./${this.directory}/`;

      if (!folder) {
        throw new Error('folder not defined');
      }
      if (!filter?.name) {
        throw new Error('file name not defined');
      }
      folderPath = folderPath + folder + '/' + filter.name;

      fs.unlink(folderPath, (err) => {
        if (err) throw new Error('file does not exists');
      });

      return '1';
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async count(tableName, { input }) {
    try {
      // Retrieve the database object from the MongoDB client
      const db = this.client.db(this.dbName);
      // Retrieve the collection object
      const collection = db.collection(tableName);
      let res;
      let query;

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

      // Call the COunt function to retrieve the results value
      res = await query.count();
      return res;
    } catch (error) {
      logger.error(error); // Log any errors
      return []; // Return an empty array in case of any errors
    }
  }

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

  async upload(tableName, { input }) {
    const { file } = input._upload.file;

    if (!file) {
      throw new Error('No file provided');
    }

    const { filename, createReadStream } = await file;

    const allowedMimeTypes = ['png', 'jpg', 'jpeg'];

    const extension = filename.split('.').pop();

    if (!allowedMimeTypes.includes(extension)) {
      throw new Error('Mime Type not allowed!');
    }

    input.filter ? '' : (input.filter = {});
    filename ? (input.filter.name = filename) : '';

    const fileExist = this.find(tableName, { input });

    if (fileExist) {
      throw new Error('File already exists');
    }

    const stream = createReadStream();

    const dir = `./${this.directory}/${tableName}`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    try {
      const out = fs.createWriteStream(dir + '/' + filename);
      stream.pipe(out);
      await finished(out);

      return { uploaded: this.host + '/' + this.directory + '/' + tableName + '/' + filename };
    } catch (error) {
      console.log(error);
    }
  }
}
