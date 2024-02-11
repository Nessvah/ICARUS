# Validation Library Documentation

This library provides a set of functions for validating various types of data, including zip codes, phone numbers, dates, emails, floating-point numbers, passwords, strings, and URLs.

## Installation

To install the library, run the following command in your terminal:

```
npm install joi bcrypt
```

## Usage

To use the library, import the necessary functions into your code. For example, to validate a zip code, you would import the `validateZipCode` function from the `validate/contacts.js` file:

```javascript
import { validateZipCode } from './validate/contacts.js';
```

Once you have imported the function, you can use it to validate a zip code by passing the zip code as an argument to the function. The function will return a Joi validation object, which you can use to check if the zip code is valid.

```javascript
const zipCode = '12345';
const result = validateZipCode(zipCode);

if (result.error) {
  // The zip code is invalid
} else {
  // The zip code is valid
}
```

## Functions

The following functions are available in the library:

- `validateZipCode(zip)`: Validates a zip code.
- `validatePhoneNumber(phone)`: Validates a phone number.
- `validateAndFormatDate(date)`: Validates and formats a date in ISO format.
- `validateMysqlDate(date)`: Validates and formats a date in MySQL format.
- `isValidEmail(email)`: Validates an email address.
- `validateFloat(number)`: Validates a floating-point number.
- `isValidPassword(password)`: Validates a password.
- `generateSalt()`: Generates a salt for hashing passwords.
- `hashPassword(password)`: Hashes a password.
- `comparePasswords(plainTextPassword, hashedPassword)`: Compares a plain text password with a hashed password.
- `validString(string)`: Validates a string.
- `validUsername(username)`: Validates a username.
- `validateUrl(url)`: Validates a URL.
- `normalizeUrl(url)`: Normalizes a URL.
- `isValidUrl(url)`: Checks if a URL is valid.

## Example

The following example shows how to use the library to validate a zip code, phone number, and email address:

```javascript
import { validateZipCode, validatePhoneNumber, isValidEmail } from './validate.js';

const zipCode = '12345';
const phoneNumber = '555-555-5555';
const email = 'test@example.com';

const zipResult = validateZipCode(zipCode);
const phoneResult = validatePhoneNumber(phoneNumber);
const emailResult = isValidEmail(email);

if (zipResult.error) {
  console.log('The zip code is invalid');
} else {
  console.log('The zip code is valid');
}

if (phoneResult.error) {
  console.log('The phone number is invalid');
} else {
  console.log('The phone number is valid');
}

if (emailResult.error) {
  console.log('The email address is invalid');
} else {
  console.log('The email address is valid');
}
```

This will output:

```
The zip code is valid
The phone number is valid
The email address is valid
```
