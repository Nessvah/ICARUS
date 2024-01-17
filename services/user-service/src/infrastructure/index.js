// Importing required dependencies
import * as dotenv from 'dotenv';
dotenv.config();
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';

// Importing schema and resolvers from the domain directory
import { typeDefs } from '../domain/schema.js';
import { resolvers } from '../domain/resolvers.js';

// Importing auth middleware from the domain directory
import { auth } from '../domain/lib.js';

// Function that have the Apollo Server configuration
async function startApolloServer() {
  // Create Apollo Server instance with the built subgraph schema
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });

  //? Start the standalone server and get the server URL, when the gateway is fully implemented, the startStandaloneServer will have to be modified or deleted?
  //const { url } =
  await startStandaloneServer(server, {
    // Add context to the server options, which provides authentication for each request
    context({ req }) {
      return auth(req);
    },
    // Specify the port to listen on from the environment variable
    listen: { port: process.env.PORT },
  });

  // Log the server URL
  //console.log(`User service running at: ${url}`);
}

// Start the Apollo server
startApolloServer();
