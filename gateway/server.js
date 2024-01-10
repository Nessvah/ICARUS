import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
// eslint-disable-next-line
import gql from 'graphql-tag';

const typeDefs = gql`
  type Query {
    me: User
  }

  type User {
    id: ID!

    username: String
  }
`;

const resolvers = {
  Query: {
    me() {
      return { id: '1', username: '@ava' };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  await startStandaloneServer(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
    listen: { port: 4000 },
  });

  //console.log(`🚀  Server ready at ${url}`);
}

startServer();
