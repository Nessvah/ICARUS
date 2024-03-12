import stream from 'stream';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

export class S3Connection {
  constructor(bucket, region, accessKeyId, secretAccessKey) {
    this.bucket = bucket;
    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      sslEnabled: false,
      s3ForcePathStyle: true,
    });
  }

  createUploadStream = async (key) => {
    try {
      const pass = new stream.PassThrough();
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: bucket,
          Key: `icarus/${key}`,
          Body: pass,
        },
      });
      return {
        key: `icarus/${key}`, // Return the key along with the stream and promise
        writeStream: pass,
        promise: upload.done(),
      };
    } catch (error) {
      console.error(error);
    }
  };

  /*   // Add a method to save the file key to the database
  async saveFileKeyToDatabase(table, filename, fileKey, databaseConnection) {
    try {
      // Assuming you have a method in your database connection class to update the fileUrl
      await databaseConnection.updateFileUrl(table, filename, fileKey);
    } catch (error) {
      throw error;
    }
  } */
}
