import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { resolvers } from '../presentation/resolvers.js';
import { typeDefs } from '../presentation/schemas.js';
import { auth } from './auth/auth.js';
import { connectDB } from './db/mssql.js';
// to ask Silvia later
// eslint-disable-next-line node/no-unpublished-import
import { customFormatError } from '../../shared/utils/error-handling/formatError.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  //error-handling classes
  formatError: customFormatError,
});

const startServer = async () => {
  try {
    connectDB();
  } catch (e) {
    //console.error('cant connect to dbs', e);
  }

  await startStandaloneServer(server, {
    // Add context to the server options, which provides authentication for each request
    context({ req }) {
      return auth(req);
    },
    // Specify the port to listen on from the environment variable
    listen: { port: process.env.PORT || 5001 },
  });
  //console.log(`🚀  Server ready at ${process.env.PORT}`);
};

startServer();
