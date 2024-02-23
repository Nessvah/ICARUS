// Import necessary modules
import fs from 'fs/promises'; // File system module for asynchronous file operations
import path from 'path'; // Module for handling file paths
import { fileURLToPath } from 'url'; // Module to convert a file URL to a file path

// Define the directory name using the current file URL
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to import all entities from JSON files
const importAll = async () => {
  try {
    // Array to store table information from JSON files
    const tables = [];

    // Read all connection files from the db folder
    const dbFolderPath = path.join(__dirname, './db');
    const connectionFiles = await fs.readdir(dbFolderPath);

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
    const entitiesFolderPath = path.join(__dirname, './entities');
    const entitiesFiles = await fs.readdir(entitiesFolderPath);

    // Loop through each entities file
    for (let file of entitiesFiles) {
      // Check if the file is a JSON file
      if (file.endsWith('.json')) {
        // Construct the full path to the JSON file
        const filePath = path.join(entitiesFolderPath, file);
        // Read JSON file data
        const jsonData = await fs.readFile(filePath, 'utf-8');
        // Parse JSON file data
        const parsedData = JSON.parse(jsonData);

        // Extract table information from parsed JSON data
        const tableName = parsedData.tables.name;
        const databaseName = parsedData.tables.database;
        const tableInfo = {
          name: tableName,
          database: databaseInfo[databaseName],
          columns: parsedData.tables.columns,
        };
        // Add table information to the tables array
        tables.push(tableInfo);
      }
    }
    // Log the extracted tables information
    console.log({ tables });
  } catch (e) {
    // Log any errors that occur during execution
    console.error(e);
  }
};

// Call the importAll function to start importing entities
importAll();
