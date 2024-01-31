import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import cors from 'cors';
import http from 'http';

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

connectDB().catch(() => {
  throw new DatabaseError();
});

const httpServer = http.createServer(app);

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: customFormatError,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Start the Apollo Server
await server.start();

app.use(
  '/',
  cors({
    origin: 'http://localhost:3000',
    allowedHeaders: 'Content-Type, Authorization',
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      return auth(req);
    },
  }),
);

await new Promise((resolve) => httpServer.listen({ port: process.env.PORT || 3001 }, resolve));
console.log(`🚀 Server ready at http://localhost:3000/`);
