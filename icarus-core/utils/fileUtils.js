export const hasNestedObjects = (obj) => {
  // go through each key on the object
  for (let key in obj) {
    // check if it's an object with values associated with
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return true;
    }

    if (typeof obj[key] === 'object' && obj[key] === null) {
      // not a nested object
      return false;
    }
  }

  // if there are no keys returns false
  return false;
};

/**
 ** Returns the mime type of file based on its filename.
 * @param {string} filename - The filename of the file.
 * @param {string} mimeTypes - all supported mimetypes for that connector
 * @returns {string} - The mime type of the file.
 */
export const getMimeType = (filename, mimeTypes) => {
  const extension = filename.split('.').pop();
  if (!mimeTypes[extension.toLowerCase()]) throw new Error('Extension not supported');

  return mimeTypes[extension.toLowerCase()];
};
