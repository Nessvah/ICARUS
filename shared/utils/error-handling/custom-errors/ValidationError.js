import { GraphQLError } from 'graphql';

class ValidationError extends GraphQLError {
  constructor(message) {
    super(message || 'Validation error', {
      extensions: {
        code: 'VALIDATION_ERROR',
      },
    });
  }
}

export { ValidationError };
