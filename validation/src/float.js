import Joi from 'joi';

/**
 * Validates a float number.
 *
 * @param {number} number - The number to be validated.
 * @returns {number} - The validated number.
 * @throws {Error} - If the number is invalid.
 */
const validateFloat = (number) => {
  const numberSchema = Joi.number().min(0).precision(2);
  const { error, value } = numberSchema.validate(number);

  if (error) {
    throw new Error('Invalid number');
  }

  return value;
};

//console.log(validateFloat(1.45646589));
