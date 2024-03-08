import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createDbConnection(config) {
  try {
    if (config.connectConfig) {
      fs.writeFileSync(
        path.join(__dirname, `../config/db/${config.connectConfig.type}.json`),
        JSON.stringify(config.connectConfig),
      );
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return `Db Connection ${config.connectConfig.type} file created successfully`;
}

export { createDbConnection };
