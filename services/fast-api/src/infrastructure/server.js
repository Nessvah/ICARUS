import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { resolvers } from '../presentation/resolvers.js';
import { typeDefs } from '../presentation/schemas.js';
import { auth } from './auth/auth.js';
import { connectDB } from './db/mssql.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
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
    listen: { port: process.env.PORT },
  });
  //console.log(`🚀  Server ready at ${url}`);
};

startServer();
