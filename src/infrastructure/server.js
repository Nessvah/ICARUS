import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import { accessLogStream, MongoDBStream } from '../shared/utils/loggers/morganLogger.js';
import Logger from '../shared/utils/loggers/logConfig.js';
import { users } from './auth/auth.js';

import { resolvers } from '../presentation/resolvers.js';
import { typeDefs } from '../presentation/schemas.js';
// import { auth } from './auth/auth.js';
import { connectDB } from './db/mssql.js';
// to ask Silvia later
// eslint-disable-next-line node/no-unpublished-import
import { customFormatError } from '../shared/utils/error-handling/formatError.js';
import { AuthRepository } from './auth/AuthRepository.js';
import { AuthServiceImplementation } from '../domain/AuthServiceImplementation.js';

import { AuthorizationError } from '../shared/utils/error-handling/CustomErrors.js';

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
  context: ({ req }) => {
    Logger.info(req.header('x-forwarded-for') || req.socket.remoteAddress);

    const token = req.headers.authorization || '';

    const authRepo = new AuthRepository(users);
    const auth = new AuthServiceImplementation(authRepo, process.env.JWT_SECRET);

    // this return email!
    const currentUser = auth.verifyToken(token);

    if (!currentUser) {
      throw new AuthorizationError('Sem autorização. Faça login.');
    }
    return { currentUser };
  },
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

  morgan('combined', { stream: accessLogStream }),
  morgan(':method :url :status :res[content-length] - :response-time ms', { stream: new MongoDBStream() }),
  expressMiddleware(server, {
    // context: ({ req }) => {
    //   Logger.info(req.header('x-forwarded-for') || req.socket.remoteAddress);
    //   const token = req.headers.authorization || '';
    //   const authRepo = new AuthRepository(users);
    //   const auth = new AuthServiceImplementation(authRepo, process.env.JWT_SECRET);
    //   const currentUser = auth.verifyToken(token);
    //   if (!currentUser) {
    //     throw new AuthorizationError('Sem autorização. Faça login.');
    //   }
    //   return { currentUser };
    // },
  }),
);
// await server(server, {
//   // Add context to the server options, which provides authentication for each request
//   context({ req }) {
//     return auth(req);
//   },
//   // Specify the port to listen on from the environment variable
//   listen: { port: process.env.PORT || 5001 },
// });
// //console.log(`🚀  Server ready at ${process.env.PORT}`);
// modify server startup
await new Promise((resolve) => httpServer.listen({ port: process.env.PORT || 5001 }, resolve));
console.log(`🚀  Server ready at ${process.env.PORT}`);
