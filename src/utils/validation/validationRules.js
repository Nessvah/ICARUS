//This file exports an object named validationRules that contains methods for validating different types of inputs using the
//Joi validation library. Each method is designed to validate a specific type of input and returns the result of the validation or error.messages.
import Joi from 'joi';

const validationRules = {
  email: (value) =>
    Joi.string()
      .email({ tlds: { allow: true } })
      //enables validation against a list of known TLDs recognized in the official list of internet - generic or country TLDs
      .required()
      .messages({
        'string.email': '"email" must be a valid email address',
        'any.required': '"email" is required',
      })
      .validate(value),

  password: (value) =>
    Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'))
      //at least 1 uppercase, 1 lowercase, 1 number and one special character.
      .messages({
        'string.min': '"password" should have a minimum length of {#limit}',
        'string.pattern.base':
          '"password" must include at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': '"password" is required',
      })
      .validate(value),

  username: (value) =>
    Joi.string()
      .alphanum()
      //A-Z and 0-9 - for instance no white spaces or _.
      .min(3)
      .max(15)
      .required()
      .messages({
        'string.alphanum': '"username" must only contain alpha-numeric characters',
        'string.min': '"username" should have a minimum length of {#limit}',
        'string.max': '"username" should have a maximum length of {#limit}',
        'any.required': '"username" is required',
      })
      .validate(value),

  address: (value) =>
    Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().length(2).required(),
      zipcode: Joi.string()
        .pattern(/^[A-Za-z0-9\s-]+$/)
        //more permissive and can match a wide range of international ZIP code formats.
        .required(),
    })
      .messages({
        'object.base': '"address" must be of type object',
        'any.required': '"{#label}" is required',
        'string.pattern.base': '"zipcode" must be a valid ZIP code',
      })
      .validate(value),

  phoneNumber: (value) =>
    Joi.string()
      .pattern(/^\+?\d{1,4}?\s?\d{1,14}$/)
      //It's specifying that the string must start with an optional +, followed by an optional sequence of up to
      //4 digits (typically the country code) optionally followed by a space, and then followed by a sequence of 1 to
      //14 digits (the main part of the phone number). This pattern is quite flexible and could match many international
      //phone number formats.
      .required()
      .messages({
        'string.pattern.base': '"phoneNumber" must be a valid phone number',
        'any.required': '"phoneNumber" is required',
      })
      .validate(value),

  // Generic rules
  URL: (value) =>
    Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .required()
      .messages({
        'string.uri': '"URL" must be a valid URI with a scheme of http or https',
        'any.required': '"URL" is required',
      })
      .validate(value),

  Date: (value) =>
    Joi.date()
      .iso()
      //YYYY-MM-DD and time if needed ????
      .required()
      .messages({
        'date.format': '"Date" must be in ISO 8601 format: YYYY-MM-DD',
        'any.required': '"Date" is required',
      })
      .validate(value),

  Number: (value) =>
    Joi.number()
      .required()
      .messages({
        'number.base': '"{#label}" must be a number',
        'any.required': '"{#label}" is required',
      })
      .validate(value),

  String: (value) =>
    Joi.string()
      .required()
      .messages({
        'string.base': '"{#label}" must be a string',
        //label will be replaced by the key (eg. username)
        'any.required': '"{#label}" is required',
      })
      .validate(value),
};

export { validationRules };
