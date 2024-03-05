import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import client from 'prom-client';
//import { accessLogStream, morganMongoDBStream, morgan } from '../utils/loggers/morganConfig.js';
import initializeLogger from '../utils/loggers/winstonConfig.js';
import { resolvers } from '../graphql/resolvers.js';
import { readConfigFile } from '../graphql/generateTypeDefs.js';
import { customFormatError } from '../utils/error-handling/formatError.js';
import { auth } from '../aws/auth/auth.js';
import { ImportThemTities } from '../config/importDemTities.js';
import { createMetricsPlugin } from '../metrics/metricsPlugin.js';

import fs from 'fs';
import { createDbPool } from './db/connector.js';
import depthLimit from 'graphql-depth-limit';

const app = express();
//create a new typedef file.
new ImportThemTities();

await readConfigFile();
// create a database pool connection.
await createDbPool();

// the httpserver handles incoming requests to our express
// this is telling apollo server to "drain" this httpserver,
// allowing for our servers to shut down gracefully.

const httpServer = http.createServer(app);

// initialize winston before anything else
export const logger = await initializeLogger;
logger.debug('Logger initialized correctly.');

const register = new client.Registry();
const metricsPlugin = await createMetricsPlugin(register);

let typeDefs;
try {
  typeDefs = fs.readFileSync('./presentation/typeDefs.graphql', 'utf8');
} catch (e) {
  logger.error(e);
}

// initialize apollo server but adding the drain plugin for out httpserver
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: customFormatError,
  validationRules: [depthLimit(3)],
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), metricsPlugin],
});

// setup express middleware for morgan http logs
//* The order matters so this needs to be before starting apollo server
// app.use(morgan(':response-time ms :graphql', { stream: accessLogStream }));
// app.use(morgan(':response-time ms :graphql', { stream: morganMongoDBStream }));

//* configuring cors before any route/endpoint
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true, // Allow credentials 'Bearer Token'
    optionSuccessStatus: 200,
  }),
);

// start our server and await for it to resolve
await server.start();

// setup express middleware to handle cors, body parsing,
// and express middleware funtion

app.use(
  '/graphql',
  express.json(),
  expressMiddleware(
    server /* , {
    context: ({ req }) => {
      if (req.body.operationName === 'IntrospectionQuery') {
        return { req };
      }
      return auth(req);
    },
  } */,
  ),
);

// Prometheus end point
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

//testing middleware
app.get('/test', async (req, res, next) => {
  res.statusCode(200);
  res.json({ test: 'Testing rest endpoint', status: 200 });
});

app.use((err, req, res, next) => {
  // Handle the error

  res.status(500).json({ error: 'Internal Server Error' });
});

// modify server startup
await new Promise((resolve) => httpServer.listen({ port: process.env.PORT || 5001 }, resolve));
logger.info(`🚀  Server ready at ${process.env.PORT}`);
