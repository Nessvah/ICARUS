//This file defines a system for dynamically applying the validation rules based on the field names of the input data. It exports a
//function named validation that enhances a given resolver function with validation logic.
import { UserInputError } from '../error-handling/CustomErrors.js';
import { validationRules } from './validationRules.js';

// The validate Fields function iterates over each key-value pair "item" object. If the operation is an update and the
// value is undefined, it skips validation for that field assuming no change is intended.
// If the value is null or an empty string (''), it throws a UserInputError
const validateFields = (item, operation) => {
  for (const [key, value] of Object.entries(item)) {
    // Skip validation if value is undefined during update, since it indicates no change is intended for that field
    if (operation === 'update' && value === undefined) {
      continue;
    }

    // Throw an error if attempting to set a value to null or an empty string during update
    if (operation === 'update' && (value === null || value === '')) {
      throw new UserInputError(`Update error: Cannot set field '${key}' to null or an empty string.`);
    }

    // If a validation rule exists for the field key in the validationRules object, it invokes the validation function associated with
    // that key on the value.
    // If validation fails (i.e., an error is returned), it throws a UserInputError with a specific error message.
    const validate = validationRules[key];
    if (validate) {
      // If the value is not null or empty (already checked above), proceed with further validation
      const { error } = validate(value);
      if (error) {
        throw new UserInputError(`User input error on field ${key}: ${error.message}`);
      }
    }
  }
};

// The validation function takes two parameters: input and operation (the operation type, defaulting to 'create').
// It first checks if the operation is 'create' and if the input.create property exists and is an array.
// If the conditions are met, it iterates over each item in the input.create array and calls the validateFields function for each item.
// f the operation is 'update' and the input.update property exists, it calls the validateFields function with the entire input.update object.
// In both cases, the validateFields function performs field-level validation based on the operation type and the provided validation rules.
const validation = async (input, operation = 'create') => {
  console.log('validation input:', input, 'operation:', operation, '______________');
  if (operation === 'create' && input.create && Array.isArray(input.create)) {
    for (const item of input.create) {
      validateFields(item, operation);
    }
  } else if (operation === 'update' && input.update) {
    // For update operations, pass the entire 'update' object for validation
    validateFields(input.update, operation);
  }
};

export { validation };
