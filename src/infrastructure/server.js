import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { accessLogStream, morgan } from '../utils/loggers/morganConfig.js';
import initializeLogger from '../utils/loggers/winstonConfig.js';
import { resolvers } from '../presentation/resolvers.js';
import { typeDefs } from '../presentation/schemas.js';
// import { auth } from './auth/auth.js';
import { connectDB } from './db/mssql.js';
import { customFormatError } from '../utils/error-handling/formatError.js';
import { MongoDBStream } from '../utils/loggers/mongoDBstream.js';

const app = express();

// the httpserver handles incoming requests to our express
// this is telling apollo server to "drain" this httpserver,
// allowing for our servers to shut down gracefully.

const httpServer = http.createServer(app);

// initialize winston before anything else
export const logger = await initializeLogger;
logger.info('Logger initialized correctly.');

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

// setup express middleware for morgan http logs
//* The order matters so this needs to be before starting apollo server
app.use(morgan(':response-time ms :graphql', { stream: accessLogStream }));
app.use(morgan(':response-time ms :graphql', { stream: new MongoDBStream() }));

// start our server and await for it to resolve
await server.start();

// setup express middleware to handle cors, body parsing,
// and express middleware funtion

app.use(
  '/',
  cors(),
  express.json(),
  // setup morgan middleware

  expressMiddleware(server, {
    context: ({ req }) => {
      return req;
    },
  }),
);

// modify server startup
await new Promise((resolve) => httpServer.listen({ port: process.env.PORT || 5001 }, resolve));
logger.info(`🚀  Server ready at ${process.env.PORT}`);
