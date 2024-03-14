import { isValidPassword } from '../../../src/aws/auth/Cognito/userValidation/passwordValidation';

describe('Password Validation', () => {
  // Valid password
  test('validates a correct password', () => {
    const password = 'Valid$Password123';
    const email = 'user@example.com';
    expect(isValidPassword(password, email)).toBe(true);
  });

  // Password containing sensitive information
  test.each([
    ['user@example.com', 'example.com'],
    ['passwordAdmin123!', 'user@example.com'],
    ['adminPassword123!', 'user@example.com'],
  ])('rejects password containing sensitive info "%s"', (password, email) => {
    expect(() => isValidPassword(password, email)).toThrow('There is sensitive info on password, please, repeat');
  });

  // Password too short or not meeting criteria
  test.each(['short', '12345678', 'onlylowercase', 'ONLYUPPERCASE', 'NoSpecial123', 'Special@butNoNum'])(
    'rejects an invalid password "%s"',
    (password) => {
      const email = 'user@example.com';
      expect(isValidPassword(password, email)).toBe(false);
    },
  );

  // Empty password
  test('rejects an empty password', () => {
    const password = '';
    const email = 'user@example.com';
    expect(() => isValidPassword(password, email)).toThrow('Password cannot be empty');
  });
});
