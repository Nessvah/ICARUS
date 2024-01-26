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

//See README.md documentation file to understand this function
const customFormatError = (error) => {
  // Check if it's an instance of your customErrors or GraphQLError
  if (
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError ||
    error instanceof DatabaseError ||
    error instanceof InternalError ||
    error instanceof NotFoundError ||
    error instanceof RateLimitError ||
    error instanceof ServiceUnavailableError ||
    error instanceof UserInputError ||
    error instanceof ValidationError ||
    error instanceof GraphQLError
  ) {
    return {
      message: error.message,
      extensions: error.extensions || {}, //the stacktrace inside extensions, location and path will not appear in production - to implement as soon as structure definitelly done.
      locations: error.locations,
      path: error.path,
    };
  }
  return error; // return other errors as they are
};

export { customFormatError };
