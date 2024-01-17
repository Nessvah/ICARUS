import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import gpl from 'graphql-tag';
// import { typeDefs } from '../presentation/ProductSchema.js';
import { resolvers } from '../presentation/ProductResolvers.js';

const typeDefs = gpl`

type Book {
  title: String
  author: Author
}

# An author has a name and a list of books
type Author {
  name: String
  books: [Book]
}
`;
// now we use the buildSubgraphSchema function to augment our schema definition with
// federation support. We provide the result of this to the Apollo Server constructor
const productServer = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

async function startProductServer() {
  await startStandaloneServer(productServer, {
    listen: { port: 5001 },
  });

  //console.log(`🚀  Server ready at ${url}`);
}

startProductServer();
