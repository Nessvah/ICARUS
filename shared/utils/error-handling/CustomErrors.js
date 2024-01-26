import { GraphQLError } from 'graphql';

// By default the error message generated by AuthenticationError will be the one selected below. But
// we can costumize our resolver errors with a different message with the AuthenticationError class.
// Examples of messages: "Please provide email and password",
// "Incorrect email or password",
// "The user belonging to this token does no longer exists",
// "User recently changed password! Please log in again",
// "There is no user with that email address",
// "Token is invalid or expired. Please log in again!",
// "Your current password is wrong"...

class AuthenticationError extends GraphQLError {
  constructor(message) {
    super(message || 'You are not logged in ! Please log in to get access.', {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }
}

class AuthorizationError extends GraphQLError {
  constructor(message) {
    super(message || 'Access denied: You do not have permission to perform this action.', {
      extensions: {
        code: 'FORBIDDEN',
      },
    });
  }
}

class DatabaseError extends GraphQLError {
  constructor(message) {
    super(message || 'A database error occurred. Please try again later.', {
      extensions: {
        code: 'DATABASE_ERROR',
      },
    });
  }
}

class InternalError extends GraphQLError {
  constructor(message) {
    super(message || 'An internal server error occurred', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}

class NotFoundError extends GraphQLError {
  constructor(message) {
    super(message || 'Page not found', {
      extensions: {
        code: 'NOT_FOUND',
      },
    });
  }
}

class RateLimitError extends GraphQLError {
  constructor(message) {
    super(message || 'You have exceeded the rate limit. Please try again later.', {
      extensions: {
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  }
}

class ServiceUnavailableError extends GraphQLError {
  constructor(message) {
    super(message || 'Service is currently unavailable. Please try again later.', {
      extensions: {
        code: 'SERVICE_UNAVAILABLE',
      },
    });
  }
}

class UserInputError extends GraphQLError {
  constructor(message) {
    // Costumize message as necessary in resovers - depending on field input name and conditions
    super(message || 'Invalid input', {
      extensions: {
        code: 'USER_INPUT_ERROR',
      },
    });
  }
}

class ValidationError extends GraphQLError {
  constructor(message) {
    super(message || 'Validation error', {
      extensions: {
        code: 'VALIDATION_ERROR',
      },
    });
  }
}

export {
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  InternalError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  UserInputError,
  ValidationError,
};
