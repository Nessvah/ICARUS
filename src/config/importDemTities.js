// Import necessary modules
import fs from 'fs/promises'; // File system module for asynchronous file operations
import path from 'path'; // Module for handling file paths
import { fileURLToPath, URL } from 'url'; // Module to convert a file URL to a file path

// Define a class for importing entities
export class ImportThemTities {
  constructor() {
    // Initialize the directory name using the current file URL
    this.__dirname = path.dirname(fileURLToPath(import.meta.url));
  }

  // Method to import all entities
  async importAll() {
    try {
      // Array to store table information
      const tables = [];

      // Read all connection files from the db folder
      const dbFolderPath = path.join(this.__dirname, './db');
      const connectionFiles = await fs.readdir(dbFolderPath);

      // Throw an error if there are no connection files
      if (connectionFiles.length === 0) {
        throw new Error('No connection files found');
      }

      // Object to store database information extracted from connection files
      const databaseInfo = {};

      // Loop through each connection file
      for (let file of connectionFiles) {
        // Extract the file name
        const fileName = path.parse(file).name;
        // Construct the full path to the connection file
        const connectionFilePath = path.join(dbFolderPath, file);
        // Read connection file data
        const connectionData = await fs.readFile(connectionFilePath, 'utf-8');
        // Parse connection file data and store it in the databaseInfo object
        databaseInfo[fileName] = JSON.parse(connectionData);
      }

      // Read entities files from the entities folder
      const entitiesFolderPath = path.join(this.__dirname, './entities');
      const entitiesFiles = await fs.readdir(entitiesFolderPath);

      // Throw an error if there are no entities files
      if (entitiesFiles.length === 0) {
        throw new Error('No entities files found');
      }

      // Loop through each entities file
      for (let file of entitiesFiles) {
        // Check if the file is a JSON file
        if (file.endsWith('.js')) {
          // Construct the full absolute path of .js entity
          const fileAbsolutePath = path.join(entitiesFolderPath, file);
          // Transforming absolute path in something readable to import()
          const filePathURL = new URL(`
          ://${fileAbsolutePath}`);
          // All information from .js file in module
          const module = await import(filePathURL);

          // Extract table information from parsed JSON data
          const tableName = module.entity.tables.name;
          const databaseName = module.entity.tables.database;
          const tableInfo = {
            name: tableName,
            database: databaseInfo[databaseName],
            columns: module.entity.tables.columns,
            backoffice: module.entity.tables.backoffice,
          };
          // Add table information to the tables array
          tables.push(tableInfo);
        }
      }
      // console.log({ tables });

      return { tables };
      // Log the extracted tables information
    } catch (e) {
      // Log any errors that occur during execution
      console.error(e);
    }
  }
}

/* // Usage
const importer = new ImportThemTities(); // Create an instance of the ImportThemTities class
importer.importAll(); // Call the importAll method to start importing entities
 */
