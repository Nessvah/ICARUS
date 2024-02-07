//This file exports an object named validationRules that contains methods for validating different types of inputs using the
//Joi validation library. Each method is designed to validate a specific type of input and returns the result of the validation or error.messages.
import Joi from 'joi';

const validationRules = {
  email: (value) =>
    Joi.string()
      .email({ tlds: { allow: true } })
      //enables validation against a list of known TLDs recognized in the official list of internet - generic or country TLDs

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
      .messages({
        'string.pattern.base': 'It must be a valid zip/postal code.',
        'any.required': 'It is required.',
      })
      .validate(value),

  phoneNumber: (value) =>
    Joi.string()
      .pattern(/^\+?\d{1,4}?\s?\d{1,14}$/)
      //It's specifying that the string must start with an optional +, followed by an optional sequence of up to
      //4 digits (typically the country code) optionally followed by a space, and then followed by a sequence of 1 to
      //14 digits (the main part of the phone number). This pattern is quite flexible and could match many international
      //phone number formats.

      .messages({
        'string.pattern.base': 'It must be a valid phone number.',
      })
      .validate(value),

  // Generic rules
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

  Number: (value) =>
    Joi.number()

      .messages({
        'number.base': 'It must be a number.',
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
