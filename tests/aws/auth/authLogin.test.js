import { authLogin } from '../../../src/aws/auth/auth';
import * as Cognito from '../../../src/aws/auth/Cognito/index.js';
import * as userValidation from '../../../src/aws/auth/Cognito/userValidation/index';

// Mock dependencies
jest.mock('../../../src/infrastructure/server.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../src/aws/auth/Cognito/index.js', () => ({
  initiateAuth: jest.fn(),
}));

jest.mock('../../../src/aws/auth/Cognito/userValidation/index', () => ({
  decryptingPassword: jest.fn(),
  isValidEmail: jest.fn(),
  tokenVerifier: jest.fn(),
}));

describe('authLogin', () => {
  beforeEach(() => {
    // Reset mocks to their default behavior before each test
    jest.clearAllMocks();

    // Default mock implementations
    userValidation.decryptingPassword.mockResolvedValue({
      email: 'test@example.com',
      password: 'password123',
    });
    userValidation.isValidEmail.mockReturnValue(true);
    Cognito.initiateAuth.mockResolvedValue({
      AuthenticationResult: {
        IdToken: 'fakeIdToken',
        AccessToken: 'fakeAccessToken',
        RefreshToken: 'fakeRefreshToken',
      },
      $metadata: {
        httpStatusCode: 200,
      },
    });
  });

  it('mock behavior test for isValidEmail', () => {
    userValidation.isValidEmail.mockReturnValueOnce(false);
    expect(userValidation.isValidEmail('invalidEmail')).toBe(false);
    expect(userValidation.isValidEmail).toHaveBeenCalledWith('invalidEmail');
  });

  it('handles failed authentication attempts', async () => {
    Cognito.initiateAuth.mockRejectedValueOnce(new Error('Authentication failed'));

    // Ensure decryptingPassword returns the expected input
    userValidation.decryptingPassword.mockResolvedValueOnce({
      email: 'test@example.com',
      password: 'incorrectPassword',
    });

    // Call with the test-specific input
    const input = { email: 'test@example.com', password: 'incorrectPassword' };

    // Await the function call and expect it to throw
    await expect(authLogin(input)).rejects.toThrow('Authentication failed');

    // Check that initiateAuth was called with the expected arguments
    expect(Cognito.initiateAuth).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'incorrectPassword',
    });
  });
});
