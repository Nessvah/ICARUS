import Joi from 'joi';

// Define a schema for a valid email address
const emailSchema = Joi.string()
  .email({
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net', 'org', 'pt', 'br'] },
  })
  .lowercase()
  .trim();

// Define a schema for a valid email address
const isValidEmail = (email) => {
  const { error } = emailSchema.validate(email);
  if (!error) {
    return true;
  } else {
    return false;
  }
};

export { isValidEmail };
