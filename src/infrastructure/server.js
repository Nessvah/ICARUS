import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
// import cors from 'cors';
import client from 'prom-client';
import { accessLogStream, morganMongoDBStream, morgan } from '../utils/loggers/morganConfig.js';
import initializeLogger from '../utils/loggers/winstonConfig.js';
import { resolvers } from '../presentation/resolvers.js';
import { typeDefs } from '../presentation/schemas.js';
// import { auth } from './auth/auth.js';
import { connectDB } from './db/mssql.js';
import { customFormatError } from '../utils/error-handling/formatError.js';
import { auth } from '../infrastructure/auth/auth.js';

const app = express();

// the httpserver handles incoming requests to our express
// this is telling apollo server to "drain" this httpserver,
// allowing for our servers to shut down gracefully.

const httpServer = http.createServer(app);

// Create a Registry to register the metrics
const register = new client.Registry();

client.collectDefaultMetrics({
  app: 'icarus-monitoring',
  prefix: 'node_',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register,
});

// initialize winston before anything else
export const logger = await initializeLogger;
logger.info('Logger initialized correctly.');

// initialize apollo server but adding the drain plugin for out httpserver
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: customFormatError,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// setup express middleware for morgan http logs
//* The order matters so this needs to be before starting apollo server
app.use(morgan(':response-time ms :graphql', { stream: accessLogStream }));
app.use(morgan(':response-time ms :graphql', { stream: morganMongoDBStream }));

// start our server and await for it to resolve
await server.start();

// setup express middleware to handle cors, body parsing,
// and express middleware funtion

app.use(
  '/graphql',
  express.json(),
  // setup morgan middleware

  expressMiddleware(server, {
    context: ({ req }) => {
      return auth(req);
    },
  }),
);

// Prometheus end point
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

//testing middleware
app.get('/test', async (req, res, next) => {
  res.json({ test: 'Testing rest endpoint' });
});

app.use((err, req, res, next) => {
  // Handle the error

  res.status(500).json({ error: 'Internal Server Error' });
});

connectDB().catch(() => {
  // throw new DatabaseError();
});

// modify server startup
await new Promise((resolve) => httpServer.listen({ port: process.env.PORT || 5001 }, resolve));
logger.info(`🚀  Server ready at ${process.env.PORT}`);
