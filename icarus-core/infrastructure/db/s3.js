import stream from 'stream';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ImportThemTities } from '../../config/importDemTities.js';

// Call the importAll method to start importing entities
const importer = new ImportThemTities();
/**
 ** Retrieves the S3 connection data from the configuration file.
 * @returns {object} The S3 connection data.
 */
const s3Data = async () => {
  try {
    const config = await importer.importAll(); // Await the result of importAll()

    if (config && config.tables) {
      // Ensure config.tables is defined
      //console.log('Config:', config, '______________'); // Log the retrieved config
      return config.connections.s3;
    } else {
      console.error('Config data is missing or incomplete.');
      return null;
    }
  } catch (error) {
    console.error('Error reading config file:', error);
    return null;
  }
};

/**
 ** Creates an S3 upload stream.
 * @param {string} key The S3 object key.
 * @param {string} mimeType The MIME type of the object.
 * @returns {{key: string, writeStream: stream.PassThrough, promise: Promise<void>}} An object containing the S3 object key, a writable stream, and a promise that resolves when the upload is complete.
 */
export const createUploadStream = async (key, mimeType) => {
  // Retrieve S3 connection data
  const s3Connection = await s3Data();
  // Create a writable stream for S3 upload
  const pass = new stream.PassThrough();

  // Initialize S3 upload instance
  const upload = new Upload({
    client: new S3Client({
      region: s3Connection.region,
      credentials: {
        accessKeyId: s3Connection.accessKeyId,
        secretAccessKey: s3Connection.secretAccessKey,
      },
      sslEnabled: false,
      s3ForcePathStyle: true,
    }),
    params: {
      Bucket: s3Connection.bucket,
      Key: key,
      Body: pass,
      ContentType: mimeType,
    },
  });

  // Return the key along with the stream and promise
  return {
    key: key,
    writeStream: pass,
    promise: upload.done(),
  };
};
