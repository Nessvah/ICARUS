import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
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
import { customFormatError } from '../utils/error-handling/formatError.js';
// eslint-disable-next-line node/no-unpublished-import
import { DatabaseError } from '../utils/error-handling/CustomErrors.js';

const app = express();

app.use(cors());

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
  '/graphql',
  cors(),
  express.json(),
  // morgan('combined', { stream: accessLogStream }),
  // morgan(':method :url :status :res[content-length] - :response-time ms', { stream: new MongoDBStream() }),
  expressMiddleware(server, {
    context: ({ req }) => {
      return auth(req);
    },
  }),
);

//testing middleware
app.get('/test-error', (req, res, next) => {
  throw new Error('Test Error');
});

app.use((err, req, res, next) => {
  // Handle the error
  console.log('Executing error handling middleware');
  res.status(500).json({ error: 'Internal Server Error' });
});
connectDB().catch(() => {
  throw new DatabaseError();
});

// modify server startup
await new Promise((resolve) => httpServer.listen({ port: process.env.PORT || 5001 }, resolve));
console.log(`🚀  Server ready at ${process.env.PORT}`);
