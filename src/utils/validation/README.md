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

- email;
- password;
- username;
- zipCode;
- phoneNumber;
- url;
- publish_date;
- expiration_date;
- start_date;
- end_date;
- founded_year;
- description;
- price;
- product_name;
- role_name;
- customer_name;
- category_name;
- name;
- content;
- title;
- code;
- discount_percent;
- rating;
- review_text;
- currency_type.

  Each method returns a validation result, which can be either a success or an error message detailing why the validation failed.

## "validation.js" file

Defines a dynamic system for applying validation rules based on input field names. It exports a function named validation to enhance resolver functions with preemptive validation logic.

### Usage:

The autoResolvers function dynamically creates resolvers based on data schema, automatically incorporating validation for mutation and update operations. This approach streamlines the addition of new data types and operations, maintaining consistent validation practices.

Resolver Validation:
Mutation Inputs: Validates inputs for mutations, ensuring compliance with defined rules.
Update Operations: Applies validation for updates, handling field-specific nuances.

```bash
    preResolvers.Mutation[table.name] = async (parent, args, context, info) => {
      // if (!context.currentUser) {
      //   throw new AuthenticationError();
      // }
      await validation(args.input); // it validates mutation inputs
      await validation(args.input, 'update'); // it validates update inputs;
      return await controller(table.name, args);
    };
```

## Implementing Validation Rules

To add a new validation rule:

- Define a new method in validationRules.js using Joi to specify the validation logic.

## Error Handling

The validation system is designed to throw a ValidationError defined previously in error-handling section (utils folder) when input validation fails. That error is complemented with the error.messages defined in each validation rule to return meaningful messages to the client.

## The validation.test.js file located in tests directory

This file has unit tests for validationRules and validation system.

## Conclusion

Our advanced validation system offers a robust framework for maintaining data integrity within Node.js and GraphQL applications. By leveraging Joi and dynamic rule application, we ensure high data quality and security standards. Developers are encouraged to extend the system by adding new validation rules as necessary, ensuring adaptability and comprehensive coverage.
