//This file exports an object named validationRules that contains methods for validating different types of inputs using the
//Joi validation library. Each method is designed to validate a specific type of input and returns the result of the validation or error.messages.
import Joi from 'joi';

//VALIDATION RULES OBJECT
const validationRules = {
  email: (value) =>
    Joi.string()
      //it will only validate email addresses with generic top-level domains and some country-code top-level domains.
      .email({
        tlds: {
          allow: ['com', 'net', 'org', 'br', 'pt', 'uk', 'us'],
        },
      })
      .messages({
        'string.email': 'It must be a valid email address.',
        //the message is to complement the UserInputError in validation.js
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
      //It might change later - not avoiding invalid zipCodes
      .messages({ 'string.pattern.base': 'Please insert a valid zip/postal code.' })
      .validate(value),

  phoneNumber: (value) =>
    Joi.string()
      .pattern(/^\+\d{1,4}\s?\d{1,14}$/)
      //It's specifying that the string must start with an optional +, followed by an optional sequence of up to
      //4 digits (typically the country code) optionally followed by a space, and then followed by a sequence of 1 to
      //14 digits (the main part of the phone number). This pattern is quite flexible and could match many international
      //phone number formats.
      .min(9)
      .max(14)
      .messages({
        'string.pattern.base':
          'Please provide country code (+XXX) followed by your number, up to 14 digits. Example: +351934955159.',
        'string.min':
          'Please provide country code (+XXX) followed by your number, up to 14 digits. Example: +351934955159.',
        'string.max':
          'Please provide country code (+XXX) followed by your number, up to 14 digits. Example: +351934955159.',
      })
      .validate(value),

  url: (value) =>
    Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .messages({
        'string.format': 'It must be a valid uri with a scheme of http or https. Example: "http://localt:5088825/"',
      })
      .validate(value),

  date: (value) =>
    Joi.date()
      .iso()
      .messages({
        'date.format':
          'It must be in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ for date and time or YYYY-MM-DD if date only.',
      })
      .validate(value),

  description: (value) =>
    Joi.string()
      .min(6)
      .max(50)
      .messages({
        'string.min': 'It should have a minimum length of {#limit}.',
        'string.max': 'It should have a maximum length of {#limit}.',
      })
      .validate(value),

  price: (value) =>
    Joi.number()
      .precision(2)
      .messages({
        'number.base': 'It must be a number.',
        'number.price': 'It must be a float with up to 2 decimal places.',
      })
      .validate(value),

  product_name: (value) =>
    Joi.string()
      .min(3)
      .max(20)
      .messages({
        'string.min': 'It should have a minimum length of {#limit}.',
        'string.max': 'It should have a maximum length of {#limit}.',
      })
      .validate(value),

  /* int: (value) =>
    Joi.number()
      .integer()
      .messages({
        'number.base': 'It must be a number.',
        'number.integer': 'It must be an integer.',
      })
      .validate(value),

  //Validates that the input is a float number and optionally specifies the precision (number of decimal places).
  float: (value) =>
    Joi.number()
      .precision(2)
      .messages({
        'number.base': 'It must be a number.',
        'number.float': 'It must be a float with up to 2 decimal places.',
      })
      .validate(value),

  string: (value) =>
    Joi.string()
      .messages({
        'string.base': 'It must be a string.',
      })
      .validate(value), */
};

export { validationRules };
