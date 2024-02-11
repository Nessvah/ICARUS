import Joi from 'joi';

// Validate zip code
const zipCodeSchema = Joi.string()
  .trim()
  .pattern(/^\d{3,6}$|^\d{4}-\d{3}$|^\d{5}-\d{4}$/)
  .required();

const validateZipCode = (zip) => {
  return zipCodeSchema.validate(zip);
};

console.log(validateZipCode('  1234-456'));

// Validate phone number
const phoneNumberSchema = Joi.alternatives().try(
  Joi.string()
    .trim()
    .pattern(/^\+\d{1,3}\d{4,12}$/)
    .required(),
  Joi.string()
    .trim()
    .pattern(/^\d{4,12}$/)
    .required(),
);

const validatePhoneNumber = (phone) => {
  // Remove all spaces and hyphens from the phone number
  const cleanedPhoneNumber = phone.replace(/[\s-]/g, '');

  return phoneNumberSchema.validate(cleanedPhoneNumber);
};

console.log(validatePhoneNumber('  +123-4567890'));
