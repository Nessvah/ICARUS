import 'dotenv/config';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
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

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: customFormatError,
  context: ({ req }) => {
    // Add context to the Apollo Server, which provides authentication for each request
    return auth(req);
  },
});

// Start the Apollo Server
server.start().then(() => {
  // Applies apollo Server middleware to the Express app
  server.applyMiddleware({ app });

  const port = process.env.PORT;
  app.listen(port, () => {
    /* console.log(`🚀  Server ready at ${process.env.PORT}`); */
  });
});
