import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class ImportThemTities {
  constructor() {
    this.__dirname = path.dirname(fileURLToPath(import.meta.url));
  }

  async importAll() {
    try {
      const tables = [];
      const dbFolderPath = path.join(this.__dirname, './db');
      const connectionFiles = await fs.readdir(dbFolderPath);

      if (connectionFiles.length === 0) {
        throw new Error('No connection files found in the db folder');
      }

      const databaseInfo = {};

      for (let file of connectionFiles) {
        const fileName = path.parse(file).name;
        const connectionFilePath = path.join(dbFolderPath, file);
        const connectionData = await fs.readFile(connectionFilePath, 'utf-8');
        databaseInfo[fileName] = JSON.parse(connectionData);
      }

      const entitiesFolderPath = path.join(this.__dirname, './entities');
      const entitiesFiles = await fs.readdir(entitiesFolderPath);

      if (entitiesFiles.length === 0) {
        throw new Error('No entities files found in the entities folder');
      }

      for (let file of entitiesFiles) {
        if (file.endsWith('.js')) {
          const filePath = path.join(entitiesFolderPath, file);
          const module = await import(filePath);
          const exportedData = module.default;

          const tableName = exportedData.tables.name;
          const databaseName = exportedData.tables.database;
          const tableInfo = {
            name: tableName,
            database: databaseInfo[databaseName],
            columns: exportedData.tables.columns,
            backoffice: exportedData.tables.backoffice,
          };
          tables.push(tableInfo);
        }
      }

      return { tables };
    } catch (e) {
      console.error(e);
      throw e; // rethrow the error to propagate it to the caller
    }
  }
}
