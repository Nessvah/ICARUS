import { auth } from '../../../src/aws/auth/auth';
import * as Cognito from '../../../src/aws/auth/Cognito/index';
import jwt from 'jsonwebtoken';

jest.mock('../../../src/infrastructure/server.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../src/aws/auth/Cognito/index', () => ({
  getUser: jest.fn(),
  initiateAuth: jest.fn(),
  isValidEmail: jest.fn(),
  decryptingPassword: jest.fn(),
  tokenVerifier: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
}));

describe('auth function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Cognito.tokenVerifier.mockResolvedValue(true);
    jwt.decode.mockReturnValue({ username: 'user@example.com' });
    Cognito.getUser.mockResolvedValue({ email: 'user@example.com' });
  });

  it('throws AuthenticationError when no token is provided', async () => {
    const req = {
      headers: {},
      body: {
        operationName: 'SomeOtherOperation',
      },
    };

    await expect(auth(req)).rejects.toThrow('You dont have token to query');
  });

  it('throws AuthenticationError when token is invalid', async () => {
    Cognito.tokenVerifier.mockResolvedValue(false); // Mock as if the token is invalid
    const req = {
      headers: {
        authorization: 'Bearer invalidToken',
      },
      body: {
        operationName: 'SomeOtherOperation',
      },
    };

    await expect(auth(req)).rejects.toThrow('invalid authorization token');
  });

  it('returns authLogin function when operation is Authorize', async () => {
    const req = {
      headers: {
        authorization: 'Bearer someToken',
      },
      body: {
        operationName: 'Authorize',
      },
    };

    const response = await auth(req);
    expect(response).toHaveProperty('authLogin');
    expect(typeof response.authLogin).toEqual('function');
  });
});
