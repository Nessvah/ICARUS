import { validationRules } from '../../src/utils/validation/validationRules.js';

// unit tests for validation rules, one by one
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

  // Founded Year Validation
  describe('founded_year', () => {
    it('should validate correct founded year', () => {
      const { error } = validationRules.founded_year('1999');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect founded year', () => {
      const { error } = validationRules.founded_year('99');
      expect(error).toBeDefined();
      expect(error.details[0].message).toEqual('It must be exactly 4 characters long.');
    });
  });

  // Description Validation
  describe('description', () => {
    it('should validate correct descriptions', () => {
      const { error } = validationRules.description('This is a valid description.');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect descriptions', () => {
      const { error } = validationRules.description('Short');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // Price Validation
  describe('price', () => {
    it('should validate correct price formats', () => {
      const { error } = validationRules.price(19.99);
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect price formats', () => {
      const { error } = validationRules.price('twenty');
      expect(error).toBeDefined();
      expect(error.details[0].message).toEqual('It must be a number.');
    });
  });

  // Product Name Validation
  describe('product_name', () => {
    it('should validate correct product names', () => {
      const { error } = validationRules.product_name('ProductName');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect product names', () => {
      const { error } = validationRules.product_name('P');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // Role Name Validation
  describe('role_name', () => {
    it('should validate correct role names', () => {
      const { error } = validationRules.role_name('Administrator');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect role names', () => {
      const { error } = validationRules.role_name('A');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // Customer Name Validation
  describe('customer_name', () => {
    it('should validate correct customer names', () => {
      const { error } = validationRules.customer_name('John Doe');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect customer names', () => {
      const { error } = validationRules.customer_name('J');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // Category Name Validation
  describe('category_name', () => {
    it('should validate correct category names', () => {
      const { error } = validationRules.category_name('Electronics');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect category names', () => {
      const { error } = validationRules.category_name('E');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // Generic Name Validation
  describe('name', () => {
    it('should validate correct names', () => {
      const { error } = validationRules.name('Valid Name');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect names', () => {
      const { error } = validationRules.name('V');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // Content Validation
  describe('content', () => {
    it('should validate correct content', () => {
      const { error } = validationRules.content('This is valid content with enough characters.');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect content', () => {
      const { error } = validationRules.content('short');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // Title Validation
  describe('title', () => {
    it('should validate correct titles', () => {
      const { error } = validationRules.title('Valid Title');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect titles', () => {
      const { error } = validationRules.title('T');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // Code Validation
  describe('code', () => {
    it('should validate correct codes', () => {
      const { error } = validationRules.code('CODE123');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect codes', () => {
      const { error } = validationRules.code('C');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // Discount Percent Validation
  describe('discount_percent', () => {
    it('should validate correct discount percentages', () => {
      const { error } = validationRules.discount_percent(10);
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect discount percentages', () => {
      const { error } = validationRules.discount_percent(100);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It must be');
    });
  });

  // Rating Validation
  describe('rating', () => {
    it('should validate correct ratings', () => {
      const { error } = validationRules.rating(5);
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect ratings', () => {
      const { error } = validationRules.rating(6);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a maximum length of');
    });
  });

  // Review Text Validation
  describe('review_text', () => {
    it('should validate correct review texts', () => {
      const { error } = validationRules.review_text('This is a sufficiently lengthy review.');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect review texts', () => {
      const { error } = validationRules.review_text('No');
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('It should have a minimum length of');
    });
  });

  // Currency Type Validation
  describe('currency_type', () => {
    it('should validate correct currency types', () => {
      const { error } = validationRules.currency_type('USD');
      expect(error).toBeUndefined();
    });

    it('should invalidate incorrect currency types', () => {
      const { error } = validationRules.currency_type('US');
      expect(error).toBeDefined();
      expect(error.details[0].message).toEqual('It must be exactly 3 characters long.');
    });
  });

  // DATES validation
  describe('Specific Date Validations', () => {
    // Testing publish_date as an example
    describe('publish_date', () => {
      it('should validate correct ISO dates for publish_date', () => {
        const { error } = validationRules.publish_date('2023-01-01T12:00:00Z');
        expect(error).toBeUndefined();
      });

      it('should invalidate incorrect dates for publish_date', () => {
        const { error } = validationRules.publish_date('01-01-2023');
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('It must be in ISO 8601 format');
      });
    });

    // Testing publish_date as an example
    describe('expiration_date', () => {
      it('should validate correct ISO dates for expiration_date', () => {
        const { error } = validationRules.expiration_date('2023-01-01T12:00:00Z');
        expect(error).toBeUndefined();
      });

      it('should invalidate incorrect dates for expiration_date', () => {
        const { error } = validationRules.expiration_date('01-01-2023');
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('It must be in ISO 8601 format');
      });
    });

    describe('start_date', () => {
      it('should validate correct ISO dates for start_date', () => {
        const { error } = validationRules.start_date('2023-01-01T12:00:00Z');
        expect(error).toBeUndefined();
      });

      it('should invalidate incorrect dates for start_date', () => {
        const { error } = validationRules.start_date('01-01-2023');
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('It must be in ISO 8601 format');
      });
    });

    describe('end_date', () => {
      it('should validate correct ISO dates for end_date', () => {
        const { error } = validationRules.end_date('2023-01-01T12:00:00Z');
        expect(error).toBeUndefined();
      });

      it('should invalidate incorrect dates for end_date', () => {
        const { error } = validationRules.end_date('01-01-2023');
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('It must be in ISO 8601 format');
      });
    });
  });
});
