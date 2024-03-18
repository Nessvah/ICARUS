import { customFormatError } from '../../icarus-core/utils/error-handling/formatError.js';
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
} from '../../icarus-core/utils/error-handling/CustomErrors.js';

describe('customFormatError', () => {
  // AUTHENTICATION ERROR TEST
  it('formats AuthenticationError correctly', () => {
    const error = new AuthenticationError('You are not logged in ! Please log in to get access.');
    const formattedError = customFormatError(error);
    expect(formattedError).toEqual({
      message: 'You are not logged in ! Please log in to get access.',
      extensions: { code: 'UNAUTHENTICATED' },
      locations: undefined,
      path: undefined,
    });
  });
  // AUTHORIZATION ERROR TEST
  it('formats AuthorizationError correctly', () => {
    const error = new AuthorizationError('Access denied: You do not have permission to perform this action.');
    const formattedError = customFormatError(error);
    expect(formattedError).toEqual({
      message: 'Access denied: You do not have permission to perform this action.',
      extensions: { code: 'FORBIDDEN' },
      locations: undefined,
      path: undefined,
    });
  });
  // DATABASE ERROR TEST
  it('formats DatabseError correctly', () => {
    const error = new DatabaseError('A database error occurred. Please try again later.');
    const formattedError = customFormatError(error);
    expect(formattedError).toEqual({
      message: 'A database error occurred. Please try again later.',
      extensions: { code: 'DATABASE_ERROR' },
      locations: undefined,
      path: undefined,
    });
  });
  // INTERNAL ERROR TEST
  it('formats InternalError correctly', () => {
    const error = new InternalError('An internal server error occurred');
    const formattedError = customFormatError(error);
    expect(formattedError).toEqual({
      message: 'An internal server error occurred',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
      locations: undefined,
      path: undefined,
    });
  });
  // NOT FOUND ERROR TEST
  it('formats NotFoundError correctly', () => {
    const error = new NotFoundError('Page not found');
    const formattedError = customFormatError(error);
    expect(formattedError).toEqual({
      message: 'Page not found',
      extensions: { code: 'NOT_FOUND' },
      locations: undefined,
      path: undefined,
    });
  });
  // RATE LIMIT ERROR TEST
  it('formats RateLimitError correctly', () => {
    const error = new RateLimitError('You have exceeded the rate limit. Please try again later.');
    const formattedError = customFormatError(error);
    expect(formattedError).toEqual({
      message: 'You have exceeded the rate limit. Please try again later.',
      extensions: { code: 'RATE_LIMIT_EXCEEDED' },
      locations: undefined,
      path: undefined,
    });
  });
  // SERVICE UNAVAILABLE ERROR TEST
  it('formats ServiceUnavailableError correctly', () => {
    const error = new ServiceUnavailableError('Service is currently unavailable. Please try again later.');
    const formattedError = customFormatError(error);
    expect(formattedError).toEqual({
      message: 'Service is currently unavailable. Please try again later.',
      extensions: { code: 'SERVICE_UNAVAILABLE' },
      locations: undefined,
      path: undefined,
    });
  });
  // USER INPUT ERROR TEST
  it('formats UserInputError correctly', () => {
    const error = new UserInputError('Invalid input.');
    const formattedError = customFormatError(error);
    expect(formattedError).toEqual({
      message: 'Invalid input.',
      extensions: { code: 'USER_INPUT_ERROR' },
      locations: undefined,
      path: undefined,
    });
  });
  //VALIDATION ERROR TEST
  it('formats ValidationError correctly', () => {
    const error = new ValidationError('Validation error.');
    const formattedError = customFormatError(error);
    expect(formattedError).toEqual({
      message: 'Validation error.',
      extensions: { code: 'VALIDATION_ERROR' },
      locations: undefined,
      path: undefined,
    });
  });
  // TESTS IF RETURNS THE ERRORS NON-CUSTOM AS THEY ARE
  it('returns non-custom errors as they are - GraphQL errors', () => {
    const error = new Error('A standard error');
    const formattedError = customFormatError(error);
    expect(formattedError).toBe(error);
  });
});
