//This file defines a system for dynamically applying the validation rules based on the field names of the input data. It exports a
//function named applyDynamicValidation that enhances a given resolver function with validation logic.
import { ValidationError } from '../error-handling/CustomErrors.js';
import { validationRules } from './validationRules.js';

//For each field in the input, it retrieves the appropriate validation function from validationRules and applies it to the field value.
//If the validation fails (indicated by an error), a ValidationError is thrown with details about the failure.
const validation = (resolver) => async (root, args, context, info) => {
  // Determine if args have 'input' object or individual fields
  const argsToValidate = args.input || args;
  //for of loop that iterates over the properties of the argsToValidate object. this object contains the input data that we want to validate.
  //within the loop "key" represents the property name of the current field in the input data. value represents the actual data of the field
  //in the input
  for (const [key, value] of Object.entries(argsToValidate)) {
    const validate = validationRules[key];
    if (validate) {
      const { error } = validate(value);
      if (error) {
        throw new ValidationError(`Validation error on field ${key}. ${error.message}`); //this message will be complemented with the messages
        //in the validationRules.js file
      }
    }
  }

  // If all fields pass validation, the original resolver function is called with the provided arguments.
  return resolver(root, args, context, info);
};

export { validation };
