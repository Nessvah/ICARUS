const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

function uuidFilenameTransform(filename = '') {
  const fileExtension = path.extname(filename);

  return `${uuid()}${fileExtension}`;
}

class FilesystemUploader {
  constructor(config = {}) {
    const { dir = '', filenameTransform = uuidFilenameTransform } = config;

    this._dir = path.normalize(dir);
    this._filenameTransform = filenameTransform;
  }

  upload(stream, { filename }) {
    const transformedFilename = this._filenameTransform(filename);

    const fileLocation = path.resolve(this._dir, transformedFilename);
    const writeStream = stream.pipe(fs.createWriteStream(fileLocation));

    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    }).then(() => `file://${fileLocation}`);
  }
}

module.exports = {
  FilesystemUploader,
  uuidFilenameTransform,
};
