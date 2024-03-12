import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { resolvers, autoResolvers } from '../graphql/resolvers.js';
import { readConfigFile } from '../graphql/generateTypeDefs.js';
import { customFormatError } from '../utils/error-handling/formatError.js';
import fs from 'fs';
import { createDbPool } from './db/connector.js';
import depthLimit from 'graphql-depth-limit';
import initializeLogger from '../utils/loggers/winstonConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// initialize winston before anything else
export const logger = await initializeLogger;
logger.debug('Logger initialized correctly.');

// create a database pool connection.

const startGraphqlServer = async (configPath) => {
  await readConfigFile(configPath);
  await autoResolvers();
  await createDbPool();

  let typeDefs;
  try {
    typeDefs = fs.readFileSync(path.join(__dirname, '../graphql/typeDefs.graphql'), 'utf8');
  } catch (e) {
    logger.error(e);
  }

  // initialize apollo server but adding the drain plugin for out httpserver
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: customFormatError,
    validationRules: [depthLimit(3)],
  });

  // start our server and await for it to resolve
  await server.start();
  return server;
};

export { startGraphqlServer };
