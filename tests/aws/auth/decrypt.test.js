import { decryptingPassword } from '../../../src/aws/auth/Cognito/userValidation/decrypt.js';
import crypto from 'crypto';
import { getSecrets } from '../../../src/aws/auth/Cognito/userValidation/secretsManager.js';
import { SECRETS } from '../../../src/utils/enums/enums.js';

// Mocking `getSecrets`
jest.mock('../../../src/aws/auth/Cognito/userValidation/secretsManager', () => ({
  getSecrets: jest.fn(),
}));

// Mocking the `crypto` module
jest.mock('crypto', () => ({
  privateDecrypt: jest.fn(),
}));

describe('decryptingPassword', () => {
  it('should correctly decrypt data', async () => {
    // Setup your mocks with return values
    getSecrets.mockResolvedValue('eliana');
    crypto.privateDecrypt.mockReturnValue(Buffer.from('decryptedPassword', 'utf8'));

    // The input should be an object with a base64 encoded password
    const input = {
      password: Buffer.from('password').toString('base64'),
      email: 'test@example.com',
    };

    const decryptedData = await decryptingPassword(input);

    // check if the function behaves as expected
    expect(decryptedData).toEqual({
      email: 'test@example.com',
      password: 'decryptedPassword',
    });
    expect(getSecrets).toHaveBeenCalledWith('private');
    expect(crypto.privateDecrypt).toHaveBeenCalled();
  });

  it('should throw an error when decryption fails', async () => {
    // Simulate a scenario where `getSecrets` throws an error
    getSecrets.mockRejectedValue(new Error('Error fetching private key'));

    // Ensure `privateDecrypt` mock is restored to its original implementation
    crypto.privateDecrypt.mockRestore();

    const input = {
      password: Buffer.from('password').toString('base64'),
      email: 'test@example.com',
    };

    // The function should throw an error when decryption fails
    await expect(decryptingPassword(input)).rejects.toThrow('Error decrypting data');

    // Check if `getSecrets` was called as expected
    expect(getSecrets).toHaveBeenCalledWith(SECRETS.PRIVATE_KEY);
    // Ensure that `crypto.privateDecrypt` is not called if `getSecrets` fails
    expect(crypto.privateDecrypt).not.toHaveBeenCalled();
  });
});
