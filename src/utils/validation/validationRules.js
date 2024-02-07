//This file exports an object named validationRules that contains methods for validating different types of inputs using the
//Joi validation library. Each method is designed to validate a specific type of input and returns the result of the validation or error.messages.
import Joi from 'joi';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

//CUSTOM VALIDATION RULES
//Custom validatin rule for phoneNumber - basically it ensures that the phoneNumber has a correct format and returns proper error message if not.
//uses libphonenumber library to check if the phone number it is valid.
const phoneNumberValidation = (value, helpers) => {
  const phoneNumber = parsePhoneNumberFromString(value);
  if (!phoneNumber || !phoneNumber.isValid()) {
    return helpers.message(
      'Invalid phone number format. Please include country code (+XXX) followed by your number, up to 14 digits. Example: +351934955159.',
    );
  }
  return value;
};

//VALIDATION RULES OBJECT
const validationRules = {
  email: (value) =>
    Joi.string()
      //it will only validate email addresses with generic top-level domains (e.g., .com, .net, .org)
      //and not country-code top-level domains (e.g., .uk, .ca, .de).
      .email({ tlds: { allow: false } })
      //enables validation against a list of known TLDs recognized in the official list of internet - generic or country TLDs
      //WE MIGHT NEED TO CHANGE AND SPECIFY WHICH ONES ARE ALLOWED LATER

      .messages({
        'string.email': 'It must be a valid email address.',
        //the message is to complement the ValidationError in validation.js
      })
      .validate(value),

  password: (value) =>
    Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'))
      //at least 1 uppercase, 1 lowercase, 1 number and one special character.
      .trim(true)
      .messages({
        'string.min': 'It should have a minimum length of {#limit}.',
        'string.pattern.base':
          'It must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
        'any.required': 'It is required.',
      })
      .validate(value),

  username: (value) =>
    Joi.string()
      .alphanum()
      //A-Z and 0-9 - for instance no white spaces or _.
      .trim(true)
      .min(3)
      .max(15)

      .messages({
        'string.alphanum': 'It must only contain alpha-numeric characters.',
        'string.min': 'It should have a minimum length of {#limit}.',
        'string.max': 'It should have a maximum length of {#limit}.',
      })
      .validate(value),

  zipCode: (value) =>
    Joi.string()
      .pattern(/^[A-Za-z0-9\s-]+$/)
      //allows for a broad range of characters that can be included in a zipCode, accommodating
      //various international zip/postal code formats which may include letters, digits, spaces, and hyphens.
      //WE MIGHT NEED TO CHANGE DUE TO RISK OF INCORRECT ZIPCODE FORMAT INPUT - FOR NOW ALLOWING EVERYTHING. LATER LIBRARY TO DEAL WITH ZIPCODES ACCORDING WITH COUNTRY
      .messages({
        'string.pattern.base': 'It must be a valid zip/postal code.',
        'any.required': 'It is required.',
      })
      .validate(value),

  phoneNumber: (value) =>
    Joi.string()
      .custom(phoneNumberValidation, 'custom phone number validation')
      //It's specifying that the string must start with an optional +, followed by an optional sequence of up to
      //4 digits (typically the country code) optionally followed by a space, and then followed by a sequence of 1 to
      //14 digits (the main part of the phone number). This pattern is quite flexible and could match many international
      .validate(value),

  // GENERIC RULES
  URL: (value) =>
    Joi.string()
      .uri({ scheme: ['http', 'https'] })

      .messages({
        'string.uri': 'It must be a valid URI with a scheme of http or https.',
      })
      .validate(value),

  Date: (value) =>
    Joi.date()
      .iso()
      //YYYY-MM-DD and time if needed ????

      .messages({
        'date.format': 'It must be in ISO 8601 format: YYYY-MM-DD.',
      })
      .validate(value),

  //Validates that the input is a number. It does not differentiate between integers and float numbers.
  //most general and it is suitable for cases where any numeric value is acceptable, regardless of whether it has a decimal component.
  Number: (value) =>
    Joi.number()

      .messages({
        'number.base': 'It must be a number.',
      })
      .validate(value),

  //Specifically validates that the input is an integer. This means the number must not have a fractional component.
  Integer: (value) =>
    Joi.number()
      .integer()
      .messages({
        'number.base': 'It must be a number.',
        'number.integer': 'It must be an integer.',
      })
      .validate(value),

  //Validates that the input is a float number and optionally specifies the precision (number of decimal places).
  Float: (value) =>
    Joi.number()
      .precision(2)
      .messages({
        'number.base': 'It must be a number.',
        'number.float': 'It must be a float with up to 2 decimal places.',
      })
      .validate(value),

  String: (value) =>
    Joi.string()

      .messages({
        'string.base': 'It must be a string.',
      })
      .validate(value),
};

export { validationRules };
