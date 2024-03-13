import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deleteDbConnection(deleteConfig) {
  try {
    if (deleteConfig.connectConfig) {
      fs.unlinkSync(path.join(__dirname, `../config/db/${deleteConfig.connectConfig.type}.json`));
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      return 'File does not exist.';
    } else {
      throw err;
    }
  }
  return `Db Connection ${deleteConfig.connectConfig.type} File deleted!`;
}

export { deleteDbConnection };
