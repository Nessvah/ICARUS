import { GraphQLError } from 'graphql';
import {
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  InternalError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  UserInputError,
  ValidationError,
} from './CustomErrors.js';

const customFormatError = (error) => {
  /* console.log('Current NODE_ENV:', process.env.NODE_ENV); */

  // Check if it's an instance of customErrors or GraphQLError
  if (
    error instanceof GraphQLError ||
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError ||
    error instanceof DatabaseError ||
    error instanceof InternalError ||
    error instanceof NotFoundError ||
    error instanceof RateLimitError ||
    error instanceof ServiceUnavailableError ||
    error instanceof UserInputError ||
    error instanceof ValidationError
  ) {
    // In development environment, show detailed error information - message, extensions, locations and path but not in production
    return {
      message: error.message,
      extensions: error.extensions || {},
      locations: error.locations,
      path: error.path,
    };
  }

  return error; // return other GraphQL errors as they are
};

export { customFormatError };
