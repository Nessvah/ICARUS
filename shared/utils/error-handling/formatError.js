import { GraphQLError } from 'graphql';
import { AuthenticationError } from './custom-errors/AuthenticationError.js';
import { AuthorizationError } from './custom-errors/AuthorizationError.js';
import { DatabaseError } from './custom-errors/DatabaseError.js';
import { InternalError } from './custom-errors/InternalError.js';
import { NotFoundError } from './custom-errors/NotFoundError.js';
import { RateLimitError } from './custom-errors/RateLimitError.js';
import { ServiceUnavailableError } from './custom-errors/ServiceUnavailableError.js';
import { UserInputError } from './custom-errors/UserInputError.js';
import { ValidationError } from './custom-errors/ValidationError.js';
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
      extensions: error.extensions || {}, //the stacktrace inside extensions will not appear in production - to implement as soon as structure definitelly done.
      locations: error.locations,
      path: error.path,
    };
  }
  return error; // return other errors as they are
};

export { customFormatError };
