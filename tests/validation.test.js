import { validationRules } from '../src/utils/validation/validationRules.js';

//UNIT TESTS FOR VALIDATION RULES - ONE BY ONE
describe('Validation Rules', () => {
  // Email Validation
  describe('email', () => {
    it('should validate correct email addresses', () => {
      const { error } = validationRules.email('eliana@gmail.com');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect email addresses', () => {
      const { error } = validationRules.email('eliana@gmail');
      expect(error).toBeDefined();
      expect(error.details[0].message).toEqual('It must be a valid email address.');
    });
  });

  // Password Validation
  describe('password', () => {
    it('should validate correct passwords', () => {
      const { error } = validationRules.password('Valid1@password');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect passwords', () => {
      const { error } = validationRules.password('short');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // Username Validation
  describe('username', () => {
    it('should validate correct usernames', () => {
      const { error } = validationRules.username('validuser123');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect usernames', () => {
      const { error } = validationRules.username('no');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // ZipCode Validation
  describe('zipCode', () => {
    it('should validate correct zip codes', () => {
      const { error } = validationRules.zipCode('12345-678');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect zip codes', () => {
      const { error } = validationRules.zipCode('!@#$%');
      expect(error).toBeDefined();
      expect(error.details[0].message).toEqual('Please insert a valid zip/postal code.');
    });
  });

  // PhoneNumber Validation
  describe('phoneNumber', () => {
    it('should validate correct phone numbers', () => {
      const { error } = validationRules.phoneNumber('+123456789012');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect phone numbers', () => {
      const { error } = validationRules.phoneNumber('12345');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Please provide country code');
    });
  });

  // URL Validation
  describe('url', () => {
    it('should validate correct URLs', () => {
      const { error } = validationRules.url('http://example.com');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect URLs', () => {
      const { error } = validationRules.url('example');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('must be a valid uri with a scheme matching the http|https pattern');
    });
  });

  // Date Validation
  describe('date', () => {
    it('should validate correct ISO dates', () => {
      const { error } = validationRules.date('2023-01-01T12:00:00Z');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect dates', () => {
      const { error } = validationRules.date('01-01-2023');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It must be in ISO 8601 format');
    });
  });
});
