import Joi from 'joi';

/**
 * Validates a URL.
 *
 * @param {string} url - The URL to validate.
 * @returns {boolean} - Returns true if the URL is valid, otherwise false.
 */
const validateUrl = (url) => {
  const urlSchema = Joi.string()
    .lowercase()
    .trim()
    .uri({
      scheme: ['http', 'https'],
    });

  return urlSchema.validate(url).error === undefined;
};

const normalizeUrl = (url) => {
  url = url.startsWith('http') ? url : `http://${url}`;
  return url;
};

const isValidUrl = (url) => {
  const normalizedUrl = normalizeUrl(url);
  return validateUrl(normalizedUrl);
};

const value = {
  url: 'www.example.com/image.jpg',
};

value.url = normalizeUrl(value.url);

//console.log('Normalized url:', value.url);
//console.log(isValidUrl(value.url));
