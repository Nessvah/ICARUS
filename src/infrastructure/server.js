import 'dotenv/config';
import { ApolloServer } from 'apollo-server-express';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { resolvers } from '../presentation/resolvers.js';
import { typeDefs } from '../presentation/schemas.js';
import { auth } from './auth/auth.js';
import { connectDB } from './db/mssql.js';
// to ask Silvia later
// eslint-disable-next-line node/no-unpublished-import
import { customFormatError } from '../../shared/utils/error-handling/formatError.js';
// eslint-disable-next-line node/no-unpublished-import
import { DatabaseError } from '../../shared/utils/error-handling/CustomErrors.js';

const app = express();

app.use(cors());

connectDB().catch(() => {
  throw new DatabaseError();
});

// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(app);

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: customFormatError,
  context: ({ req }) => {
    return auth(req);
  },
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

// setup express middleware to handle cors, body parsing,
// and express middleware funtion

app.use(
  '/',
  cors(),
  express.json(),
  // morgan('combined', { stream: accessLogStream }),
  // morgan(':method :url :status :res[content-length] - :response-time ms', { stream: new MongoDBStream() }),
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

// modify server startup
await new Promise((resolve) => httpServer.listen({ port: process.env.PORT || 5001 }, resolve));
console.log(`🚀  Server ready at ${process.env.PORT}`);
