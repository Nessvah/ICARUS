import fs from 'node:fs';

/**
 * Reads the configuration file and parses its contents.
 * @returns {Object} Parsed configuration object.
 */
export const readConfigFile = () => {
  try {
    return JSON.parse(fs.readFileSync('../src/config.json', 'utf8'));
  } catch (error) {
    throw new Error('Error reading config file, ', error.message);
  }
};
