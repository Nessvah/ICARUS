import stream from 'stream';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ImportThemTities } from '../../config/importDemTities.js';

// Call the importAll method to start importing entities
const importer = new ImportThemTities();

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

export const createUploadStream = async (key, mimeType) => {
  const s3Connection = await s3Data();
  console.log({ s3Connection });
  const pass = new stream.PassThrough();
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
  return {
    key: key, // Return the key along with the stream and promise
    writeStream: pass,
    promise: upload.done(),
  };
};
