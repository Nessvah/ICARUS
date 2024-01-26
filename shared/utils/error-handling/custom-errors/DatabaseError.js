import { GraphQLError } from 'graphql';

// Examples of database errors that can be used with this class, instead of the deafult message
// - please see documentation and Authectication class:
// ("Failed to connect to the database."),
// ("Error in retrieving data: data source is not available.")

class DatabaseError extends GraphQLError {
  constructor(message) {
    super(message || 'A database error occurred. Please try again later.', {
      extensions: {
        code: 'DATABASE_ERROR',
      },
    });
  }
}

export { DatabaseError };
