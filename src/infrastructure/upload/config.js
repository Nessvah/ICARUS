import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
  },
});

const config = {
  s3: {
    client: s3Client,
    params: {
      ACL: 'public-read',
      Bucket: process.env.S3_BUCKET,
    },
  },
  app: {
    storageDir: 'tmp',
  },
};

export default config;
