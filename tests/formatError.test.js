import { customFormatError } from '../shared/utils/error-handling/formatError.js';
import { AuthenticationError } from '../shared/utils/error-handling/custom-errors/AuthenticationError.js';
import { AuthorizationError } from '../shared/utils/error-handling/custom-errors/AuthorizationError.js';

//AUTHENTICATION ERROR TEST
describe('AuthenticationError', () => {
  test('customFormatError formats AuthenticationError correctly', () => {
    // instance of AuthenticationError
    const message = 'You are not logged in ! Please log in to get access.';
    const authError = new AuthenticationError(message);

    // customFormatError function
    const formattedError = customFormatError(authError);

    // Define what the expected object is
    const expectedFormattedError = {
      message: message,
      extensions: {
        code: 'UNAUTHENTICATED',
      },
      // locations and path are not set in this context, they will be undefined
      locations: undefined,
      path: undefined,
    };

    // Check that the formatted error matches the expected object
    expect(formattedError).toEqual(expectedFormattedError);
  });

  //AUTHORIZATION ERROR TEST
  test('customFormatError formats AuthorizationError correctly', () => {
    const authZMessage = 'Access denied: You do not have permission to perform this action.';
    const authZError = new AuthorizationError(authZMessage);

    const formattedAuthZError = customFormatError(authZError);

    const expectedFormattedAuthZError = {
      message: authZMessage,
      extensions: {
        code: 'FORBIDDEN',
      },
      locations: undefined,
      path: undefined,
    };

    expect(formattedAuthZError).toEqual(expectedFormattedAuthZError);
  });

  // DATABASE ERROR TEST
});
