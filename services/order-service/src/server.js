import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';

import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const __dirname = dirname(new URL(import.meta.url).pathname);
const schema = readFileSync(join(__dirname, './presentation/OrderSchema.graphql'), 'utf8');
const typeDefs = gql`
  ${schema}
`;

import resolvers from './presentation/OrderResolver.js';

const server = new ApolloServer({
  schema: buildSubgraphSchema({
    typeDefs,
    resolvers,
  }),
});

async function startServer() {
  await startStandaloneServer(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
    listen: { port: 4000 },
  });
}

startServer();
