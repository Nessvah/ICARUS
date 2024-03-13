import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: 'AKIA3GNW2CMNR3P4CZHS',
    secretAccessKey: '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',
  },
});

export const config = {
  s3: {
    client: s3,
    params: {
      ACL: 'public-read',
      Bucket: 'buuckete',
    },
  },
  app: {
    storageDir: 'tmp',
  },
};
