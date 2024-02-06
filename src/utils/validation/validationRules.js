//This file exports an object named validationRules that contains methods for validating different types of inputs using the
//Joi validation library. Each method is designed to validate a specific type of input and returns the result of the validation.
import Joi from 'joi';

const validationRules = {
  email: (value) => Joi.string().required().email().validate(value),
  password: (value) => Joi.string().required().min(8).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).validate(value),
  username: (value) => Joi.string().alphanum().min(3).max(30).validate(value),
  address: (value) =>
    Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zipcode: Joi.string()
        .regex(/^\d{5}(?:[-\s]\d{4})?$/)
        .required(),
    }).validate(value),
  phoneNumber: (value) =>
    Joi.string()
      .pattern(/^\+?\d{1,4}?\s?\d{1,14}$/) // international and local phone numbers
      .validate(value),

  // generic rules
  URL: (value) => Joi.string().uri().validate(value),
  Date: (value) => Joi.date().iso().validate(value),
  String: (value) => Joi.string().validate(value),
};

export { validationRules };
