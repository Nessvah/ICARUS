import Joi from 'joi';

//iso date
const validateAndFormatDate = (date) => {
  const dateSchema = Joi.date().iso();
  const { error } = dateSchema.validate(date);

  if (error) {
    return null; // or handle the error in a desired way
  }

  const formattedDate = new Date(date).toLocaleDateString('pt-PT');
  return formattedDate;
};

//console.log(validateAndFormatDate('2020-01-01T00:00:00.000Z'));

//deal with mysql date
const validateMysqlDate = (date) => {
  const dateSchema = Joi.date().iso();
  const { error } = dateSchema.validate(date);

  if (error) {
    return null; // or handle the error in a desired way
  }

  const formattedDate = new Date(date.replace(/-/g, '/')).toLocaleDateString('pt-PT');
  return formattedDate;
};

//console.log(validateMysqlDate('2020-01-01'));
