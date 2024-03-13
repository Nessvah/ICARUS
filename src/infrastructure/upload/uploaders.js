import { s3, config } from './config.js';
import { S3Uploader, FilesystemUploader } from './gql-uploaders.js';

export const uploader = new S3Uploader(s3, {
  baseKey: 'icarus',
  uploadParams: {
    CacheControl: 'max-age:31536000',
    ContentDisposition: 'inline',
  },
});

export const fsUploader = new FilesystemUploader({
  dir: config.app.storageDir,
  filenameTransform: (filename) => `${Date.now()}_${filename}`,
});
