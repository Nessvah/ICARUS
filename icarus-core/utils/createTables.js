import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createTables(config) {
  try {
    if (config.settings) {
      config.settings.forEach((element) => {
        fs.writeFileSync(
          path.join(__dirname, `../config/entities/${element.tables.name}.json`, JSON.stringify(element)),
        );
      });
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return `Table files created successfully`;
}

export { createTables };
