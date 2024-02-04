import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
// import morgan from 'morgan';
// import { accessLogStream, MongoDBStream } from '../utils/loggers/morganLogger.js';
import logger from '../utils/loggers/logConfig.js';

import { resolvers } from '../presentation/resolvers.js';
import { typeDefs } from '../presentation/schemas.js';
// import { auth } from './auth/auth.js';
import { connectDB } from './db/mssql.js';
import { customFormatError } from '../utils/error-handling/formatError.js';

const app = express();

// the httpserver handles incoming requests to our express
// this is telling apollo server to "drain" this httpserver,
// allowing for our servers to shut down gracefully.

const httpServer = http.createServer(app);

// initialize apollo server but adding the drain plugin for out httpserver
const server = new ApolloServer({
  typeDefs,
  resolvers,
  //error-handling classes
  formatError: customFormatError,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// try to connect to the db
try {
  connectDB();
} catch (e) {
  //console.error('cant connect to dbs', e);
}

// start our server and await for it to resolve
await server.start();

// setup express middleware to handle cors, body parsing,
// and express middleware funtion

app.use(
  '/',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: ({ req }) => {},
  }),
);

// modify server startup
await new Promise((resolve) => httpServer.listen({ port: process.env.PORT || 5001 }, resolve));
logger.info(`🚀  Server ready at ${process.env.PORT}`);
