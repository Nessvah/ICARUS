import stream from 'stream';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

export const bucket = 'buuckete';

export const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: 'AKIA3GNW2CMNR3P4CZHS',
    secretAccessKey: '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',
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
});

export const createUploadStream = (key, mimeType) => {
  const pass = new stream.PassThrough();
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: bucket,
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
