import { GraphQLError } from 'graphql';

class ServiceUnavailableError extends GraphQLError {
  constructor(message) {
    super(message || 'Service is currently unavailable. Please try again later.', {
      extensions: {
        code: 'SERVICE_UNAVAILABLE',
      },
    });
  }
}

export { ServiceUnavailableError };
