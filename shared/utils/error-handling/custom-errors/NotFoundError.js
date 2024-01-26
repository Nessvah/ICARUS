import { GraphQLError } from 'graphql';

class NotFoundError extends GraphQLError {
  constructor(message) {
    super(message || 'Page not found', {
      extensions: {
        code: 'NOT_FOUND',
      },
    });
  }
}

export { NotFoundError };
