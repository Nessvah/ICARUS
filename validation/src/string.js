import Joi from 'joi';

// Create a reusable schema for trimming strings
const stringSchema = Joi.string().trim();

// Function to validate a string
const validString = (string) => {
  const { error } = stringSchema.validate(string);
  return error === undefined;
};

//console.log(validString('  nheco nheco   ')); // true

// Create a schema for validating usernames
const usernameSchema = Joi.string().lowercase().trim();

// Function to validate a username
const validUsername = (username) => {
  const { error } = usernameSchema.validate(username);
  return error === undefined;
};

//console.log(validUsername('Johndoe')); // true
