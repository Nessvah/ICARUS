require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { startStandaloneServer } = require('@apollo/server/standalone');
const jwt = require('jsonwebtoken');

const { typeDefs } = require('../domain/schema');
const { resolvers, users } = require('../domain/resolvers');

async function startApolloServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });
  //const { url } =
  await startStandaloneServer(server, {
    context({ req }) {
      let currentUser = null;
      if (req.headers.authorization) {
        try {
          const { email } = jwt.verify(req.headers.authorization, 'icarusteam');
          currentUser = users.find((user) => {
            if (user.email === email) {
              return user;
            }
            return false;
          });
        } catch (error) {
          throw new Error(`invalid authorization token`);
        }
      }
      return {
        currentUser,
      };
    },
    listen: { port: process.env.PORT },
  });
  //console.log(`User service running at: ${url}`);
}

startApolloServer();
