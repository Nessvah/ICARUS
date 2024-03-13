import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deleteTables(deleteConfig) {
  try {
    if (deleteConfig.settings) {
      fs.unlinkSync(path.join(__dirname, `../config/entities/${deleteConfig.settings.name}.json`));
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      return 'File does not exist.';
    } else {
      throw err;
    }
  }
  return `Table ${deleteConfig.settings.name} File deleted!`;
}

export { deleteTables };
