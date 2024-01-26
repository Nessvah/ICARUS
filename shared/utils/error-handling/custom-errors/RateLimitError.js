import { GraphQLError } from 'graphql';

class RateLimitError extends GraphQLError {
  constructor(message) {
    super(message || 'You have exceeded the rate limit. Please try again later.', {
      extensions: {
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  }
}

export { RateLimitError };
