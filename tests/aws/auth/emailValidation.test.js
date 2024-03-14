import { isValidEmail } from '../../../src/aws/auth/Cognito/userValidation/emailValidation.js';

describe('Email Validation', () => {
  // valid email
  test.each([
    'example@example.com',
    'name123@domain.pt',
    // .trim() in the Joi schema
    ' example@example.com',
    'example@example.com ',
  ])('validates the email "%s" as true', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  // invalid emails
  test.each(['usernamedomain.com', 'user@domain', 'name@domain.c', 'name@domain.invalidtld', 'user name@domain.com'])(
    'validates the email "%s" as false',
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );

  // Test cases for uppercase emails which should be valid due to lowercase conversion
  test.each(['NAME@DOMAIN.COM', 'USER@DOMAIN.BR'])(
    'validates the email "%s" as true after converting to lowercase',
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  // Test case for an email with a trailing dot, which should be invalid
  test('validates the email "user@domain.com." as false due to trailing dot', () => {
    const email = 'user@domain.com.';
    expect(isValidEmail(email)).toBe(false);
  });
});
