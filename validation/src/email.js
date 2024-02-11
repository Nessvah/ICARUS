//validate email format
/* const emailRegex =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const isValidEmail = (email) => emailRegex.test(email); */

import Joi from 'joi';

// Define a schema for a valid email address
const emailSchema = Joi.string()
  .email({
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net', 'org', 'pt'] },
  })
  .lowercase()
  .trim();

// Define a schema for a valid email address
const isValidEmail = (email) => {
  const { error, value } = emailSchema.validate(email);
  if (error === undefined) {
    console.log(value);
  }
  return error === undefined;
};

// Log the result of calling `isValidEmail` with the example email
//console.log(isValidEmail('joHndoe@example.com'));
