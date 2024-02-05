import fs from 'node:fs';
import morgan from 'morgan';
import { logger } from '../../infrastructure/server.js';

//* The log data will be written to the file asynchronously
//* Using streams is beneficial in larger-scale applications or when
//* dealing with large amounts of log data.
const accessLogStream = fs.createWriteStream('./logs/access.log', { flags: 'a' });

accessLogStream.on('error', (error) => {
  logger.error('Error creating write stream:', error);
});
/**
 * Defining a custom morgan token for logging Graphql
 * queries and mutations as well other necessary info
 */

morgan.token('graphql', (req, res) => {
  // check if it's a graphql query
  if (req.body && req.body.query) {
    const { query, variables, operationName } = req.body;

    // if the operation is an introspection query return nothing
    if (operationName === 'IntrospectionQuery') {
      return 'Introspection';
    }

    // check if we have user info in the context
    const user = req.context?.user || {};

    const data = {
      GRAPHQL: {
        operationName: `${operationName}` || 'N/A',
        query: `${query}` || 'N/A',
        variables: JSON.stringify(variables) || 'N/A',
      },
      user: {
        userId: user.id || 'N/A',
        roles: user.roles || ['guest'],
      },
      request: {
        ip: req.ip,
        headers: req.headers,
      },
      response: {
        status: res.statusCode,
        headers: res.getHeaders(),
      },
      executionTime: {},
    };

    return JSON.stringify(data);
  }
});

// Create a stream for Morgan to write logs to MongoDB
const morganMongoDBStream = {
  write: (log) => {
    logger.info(typeof log);
  },
};

export { accessLogStream, morganMongoDBStream, morgan };
