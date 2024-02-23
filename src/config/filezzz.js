// Import necessary modules
import fs from 'fs/promises'; // File system module for asynchronous file operations
import path from 'path'; // Module for handling file paths
import { fileURLToPath } from 'url'; // Module to convert a file URL to a file path

// Define the directory name using the current file URL
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to import entities from JSON files
async function importEntities() {
  try {
    const tables = [];

    // Read all connection files from the db folder
    const dbFolderPath = path.join(__dirname, './db');
    const connectionFiles = await fs.readdir(dbFolderPath);

    // Read database information from each connection file
    const databaseInfo = {};
    for (let file of connectionFiles) {
      const fileName = path.parse(file).name;
      const connectionFilePath = path.join(dbFolderPath, file);
      const connectionData = await fs.readFile(connectionFilePath, 'utf-8');
      databaseInfo[fileName] = JSON.parse(connectionData);
    }

    // Read entities files from the entities folder
    const entitiesFolderPath = path.join(__dirname, './entities');
    const entitiesFiles = await fs.readdir(entitiesFolderPath);
    for (let file of entitiesFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(entitiesFolderPath, file);
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(jsonData);

        // Associate database information with table information
        const tableName = parsedData.tables.name;
        const databaseName = parsedData.tables.database;
        const tableInfo = {
          name: tableName,
          database: databaseInfo[databaseName],
          columns: parsedData.tables.columns,
        };
        tables.push(tableInfo);
      }
    }
    console.log({ tables });
  } catch (e) {
    console.error(e);
  }
}

// Call the importEntities function when the module is loaded
importEntities();

// Function to create a new entity
export async function createEntity(entityName, entity) {
  try {
    // Validate the entity against the structure
    const { tables } = entity;
    if (!tables || !tables.name || !tables.database || !tables.columns) {
      throw new Error('Invalid entity structure');
    }

    // Generate a unique ID for the entity
    const id = generateId(); // Implement a function to generate unique IDs

    // Define the file path for the entity
    const filePath = path.resolve(__dirname, `data/${entityName}/${id}.json`);

    // Write the entity data to a JSON file
    await fs.writeFile(filePath, JSON.stringify(entity, null, 2));

    // Return the newly created entity
    return getEntityById(entityName, id);
  } catch (error) {
    console.error('Error creating entity:', error);
    throw error;
  }
}

// Function to update an existing entity
export async function updateEntity(entityName, id, updates) {
  try {
    // Get the original entity data
    const original = await getEntityById(entityName, id);
    if (!original) throw new Error(`Entity with ID ${id} not found`);

    // Merge updates with original entity
    const merged = { ...original, ...updates };

    // Validate the merged entity against the structure
    const { tables } = merged;
    if (!tables || !tables.name || !tables.database || !tables.columns) {
      throw new Error('Invalid entity structure');
    }

    // Define the file path for the entity
    const filePath = path.resolve(__dirname, `data/${entityName}/${id}.json`);

    // Write the updated entity data to a JSON file
    await fs.writeFile(filePath, JSON.stringify(merged, null, 2));

    // Return the updated entity
    return getEntityById(entityName, id);
  } catch (error) {
    console.error(`Error updating entity with ID ${id}:`, error);
    throw error;
  }
}

// Function to delete an entity
export async function deleteEntity(entityName, id) {
  try {
    // Define the file path for the entity
    const filePath = path.resolve(__dirname, `data/${entityName}/${id}.json`);

    // Delete the entity file
    await fs.unlink(filePath);

    // Indicate successful deletion
    return true;
  } catch (error) {
    console.error(`Error deleting entity with ID ${id}:`, error);
    throw error;
  }
}

// Function to get an entity by its ID
export async function getEntityById(entityName, id) {
  try {
    // Read the entity data from the corresponding JSON file
    const data = await fs.readFile(path.resolve(__dirname, `data/${entityName}/${id}.json`), 'utf8');
    // Parse the entity data and return it
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error getting entity with ID ${id}:`, error);
    throw error;
  }
}

// Function to get all entities for a given entity name
export async function getAllEntities(entityName) {
  try {
    // Read all JSON files in the entity folder
    const files = await fs.readdir(path.resolve(__dirname, `data/${entityName}`));
    // Retrieve and return all entities from the files
    const entities = await Promise.all(
      files.map(async (file) => {
        const id = path.parse(file).name;
        return getEntityById(entityName, id);
      }),
    );
    // Filter out null entities and return the valid ones
    return entities.filter((entity) => entity !== null);
  } catch (error) {
    console.error(`Error getting all entities for ${entityName}:`, error);
    throw error;
  }
}

// Export default object containing CRUD operations
export default {
  getEntityById,
  getAllEntities,
  createEntity,
  updateEntity,
  deleteEntity,
};
