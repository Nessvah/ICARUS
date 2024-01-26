import { GraphQLError } from 'graphql';

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

export { UserInputError };
