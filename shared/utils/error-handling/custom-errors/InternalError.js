import { GraphQLError } from 'graphql';

class InternalError extends GraphQLError {
  constructor(message) {
    super(message || 'An internal server error occurred', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}

export { InternalError };
