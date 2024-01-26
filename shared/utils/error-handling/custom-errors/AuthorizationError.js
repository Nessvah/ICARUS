import { GraphQLError } from 'graphql';

// The default message is "You do not have permission to perform this action."
// You can customize this message in resolvers for different authorization issues
// examples: throw new AuthorizationError("Unauthorized: You need a premium account to access this feature."),
// ("Access denied: Your account is currently suspended.")
class AuthorizationError extends GraphQLError {
  constructor(message) {
    super(message || 'Access denied: You do not have permission to perform this action.', {
      extensions: {
        code: 'FORBIDDEN',
      },
    });
  }
}

export { AuthorizationError };
