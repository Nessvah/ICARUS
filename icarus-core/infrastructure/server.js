import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
//import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { resolvers, autoResolvers } from '../graphql/resolvers.js';
import { readConfigFile } from '../graphql/generateTypeDefs.js';
import { customFormatError } from '../utils/error-handling/formatError.js';
import fs from 'fs';
//import http from 'http';
//import express from 'express';

import { createDbPool } from './db/connector.js';
import depthLimit from 'graphql-depth-limit';
import initializeLogger from '../utils/loggers/winstonConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';

// create a dirname to complete the path to the current file.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// initialize winston before anything else (logger)
export const logger = await initializeLogger;
logger.debug('Logger initialized correctly.');

//const app = express();
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

/**
 ** Initialize the Apollo server
 * @param {string} configPath - The path to the configuration file
 * @returns {ApolloServer} The Apollo server instance
 */
const startGraphqlServer = async (configPath) => {
  // read the config file and generate the typeDefs and the 'data' information, that will be used in other parts of the application.
  await readConfigFile(configPath);
  //Generates the resolvers for the GraphQL schema that will be used in the apollo server based on the available resolver files.
  await autoResolvers();
  // create a database pool connection.
  await createDbPool();
  // import the typeDefs that will be used in the apollo server.

  // the httpserver handles incoming requests to our express
  // this is telling apollo server to "drain" this httpserver,
  // allowing for our servers to shut down gracefully.

  //const httpServer = http.createServer(app);

  let typeDefs;
  try {
    typeDefs = fs.readFileSync(path.join(__dirname, '../graphql/typeDefs.graphql'), 'utf8');
  } catch (e) {
    logger.error(e);
  }

  //create a new apollo server instance.
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: customFormatError,
    validationRules: [depthLimit(3)], //config the depth limit of the graphql query to 3.
    csrfPrevention: false,
    upload: true,
  });

  // start the apollo server.
  await server.start();
  //return the apollo server instance started.
  return server;
};

export { startGraphqlServer };
