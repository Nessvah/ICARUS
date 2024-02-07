# Validation Documentation

## Introduction

This README provides detailed documentation on the validation system implemented in our project. Our system leverages the Joi validation library to ensure that all user inputs meet our predefined standards before they are processed by our resolvers. This document aims to guide developers on how to use and extend the validation system effectively.

### Prerequisites

Ensure you have Joi installed in your project. If not, you can add it by running:

npm install joi or npm install after git pull

# Files overview

## "validationRules.js file

Exports an object named validationRules that contains validation methods for different input types. These methods utilize Joi to define validation criteria.

### Available Validation Methods:

- email: Validates email addresses.
- password: Ensures passwords meet complexity requirements.
- username: Validates usernames for alpha-numeric characters and length constraints.
- zipCode: Checks if an zipCode contains required format.
- phoneNumber: Validates phone number formats.
- URL: Ensures URLs follow http or https schemes.
- Date: Validates date strings against the ISO 8601 format.
- Number: Checks for numeric input.
- Float: Validates that the input is a number. It does not differentiate between integers and float numbers.
- Integers: validates that the input is an integer. This means the number must not have a fractional component.
- String: Validates string inputs.

Each method returns a validation result, which can be either a success or an error message detailing why the validation failed.

## "validation.js" file

Exports a function named validation that enhances GraphQL resolver functions with validation logic. It dynamically applies the appropriate validation rules to input data based on field names.

### Usage:

Wrap your resolver functions with the validation function to automatically validate input arguments against the defined rules in validationRules.js before proceeding with the resolver's logic.

Example:

```bash
import { validation } from '../utils/validation/validation.js';

testCreateUser: validation(async (_, { input }) => {
      const newUser = {
        id: 1,
        ...input,
      };

      return newUser;
    }),

```

## Implementing Validation Rules

To add a new validation rule:

1- Define a new method in validationRules.js using Joi to specify the validation logic.

2- Use the newly defined method in validation.js by referencing it through the input fields you wish to validate.

## Error Handling

The validation system is designed to throw a ValidationError defined previously in error-handling section (utils folder) when input validation fails. That error is complemented with the error.messages defined in each validation rule to return meaningful messages to the client.

## The validation.test.js file located in tests directory

This file has unit tests for validationRules and validation system.

## Conclusion

Our validation system provides a robust and flexible framework for ensuring data integrity across your Node.js and GraphQL application. By leveraging Joi and dynamic validation rule application, we can maintain high standards of data quality and security.

Feel free to extend the system by adding more validation rules as required for your project's needs. For more information on Joi and its capabilities, visit the Joi documentation.
