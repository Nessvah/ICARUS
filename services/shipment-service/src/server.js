// Server initialization logic - entry point of shipment service
import { ApolloServer, gql } from 'apollo-server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { ApolloServerPluginInlineTraceDisabled } from 'apollo-server-core';
//plugin to disable automatic inline tracing in apollo federation
import logger from './logger.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import resolvers from './presentation/ShipmentResolvers.js';
const typeDefs = gql(readFileSync(join(__dirname, 'presentation', 'ShipmentSchema.graphql'), 'utf-8'));

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  plugins: [ApolloServerPluginInlineTraceDisabled()],
});

const PORT = process.env.PORT || 4055;
server.listen(PORT).then(({ url }) => {
  logger.info(`Shipment service running at ${url}`);
});
