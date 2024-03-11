import fs from 'fs';
import { permissionHook } from './permissionHook.js';

const beforeResolver = async (table, args, QueryType) => {
  try {
    // Definition of entity path
    const filePath = `config/entities/${table}.js`;

    // Verifying if the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Importing entity informations
    const entityInfo = await import(`../../${filePath}`);

    // Verifying if there is a permission hook for this Query
    const hasPermission = await permissionHook(entityInfo, table, args, QueryType);

    // Verification of permission for the required query
    if (!hasPermission) {
      throw new Error('Permission denied');
    }
  } catch (error) {
    throw new Error(error);
  }
};

export { beforeResolver };
