import stream from 'stream';
import { S3, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { logger } from '../server.js';

//Create s3Class to handle bucket crud operations

export class S3Connection {
  constructor(currentTableInfo) {
    this._pool = currentTableInfo.pool;
    this._bucket = currentTableInfo.bucket;
    this._region = currentTableInfo.region;
    //console.log('currentTableInfo', currentTableInfo.bucket);
  }

  /**
   * Processes the filter object to construct a filter function for S3 objects.
   *
   * @param {object} input - The input object containing filter options.
   * @returns {function} - A filter function for S3 objects.
   */
  async processFilter(input) {
    //console.log({ input });
    try {
      // Check if input is empty or null, return all objects if true
      if (!input || (Object.keys(input).length === 0 && input.constructor === Object)) {
        let listObjectsCommand = new ListObjectsV2Command({
          Bucket: this._bucket,
        });

        const { Contents } = await this._pool.send(listObjectsCommand);
        return Contents;
      }

      // If only input.name is provided without input.directory, return an error
      if (input.name && !input.directory) {
        return 'Cannot filter by name without specifying directory.';
      }

      let filter = {};

      // Check if input.directory exists
      if (input.directory) {
        filter.Prefix = input.directory;
      }

      const { Contents } = await this._pool.send(
        new ListObjectsV2Command({
          Bucket: this._bucket,
          ...filter,
        }),
      );

      // Filter Contents based on the name
      if (input.name) {
        const filteredContents = Contents.filter((content) => {
          const keyParts = content.Key.split('/');
          const fileName = keyParts[keyParts.length - 1];
          return fileName.startsWith(input.name);
        });

        //console.log({ filteredContents });
        return filteredContents;
      }

      //console.log({ Contents });
      return Contents;
    } catch (error) {
      console.error('Error processing filter:', error);
      throw error; // Re-throw the error to propagate it
    }
  }

  async find(_, { input }) {
    //console.log({ input });
    try {
      const filter = await this.processFilter(input.filter);
      console.log({ filter });

      let command;
      command = new ListObjectsV2Command({
        Bucket: this._bucket,
      }); // Create ListObjectsCommand instance
      const { Contents } = await this._pool.send(command); // Execute the command

      let files = [];
      if (filter) {
        files = filter.map((content) => {
          const directory = content.Key.split('/').slice(0, -1).join('/'); // Extract directory from Key
          const name = content.Key.split('/').pop(); // Extract file name from Key
          const type = name.split('.').pop(); // Extract file type from file name
          const location = `https://${this._bucket}.s3.${this._region}.amazonaws.com/${content.Key}`;

          return {
            directory: directory,
            name: name,
            lastModified: content.LastModified,
            size: content.Size,
            type: type,
            location: location,
          };
        });
      }

      console.log('BANANAAA' + JSON.stringify(input.filter));

      if (input.filter) {
        this.processFilter(input.filter);
      }

      //console.log({ files });
      return files; // Return both directories and files
    } catch (error) {
      console.error('Error reading object:', error);
      return null;
    }
  }

  async createUploadStream(key, mimeType) {
    // Retrieve S3 connection data
    const s3Connection = this._pool;
    // Create a writable stream for S3 upload
    const pass = new stream.PassThrough();

    // Initialize S3 upload instance
    const upload = new Upload({
      client: s3Connection,
      params: {
        Bucket: this._bucket,
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
  }

  async upload(tableName, { input }) {
    //console.log({ input });
    const { file } = input._upload.file;
    const folder = input._upload.folder.toLowerCase();
    //console.log(file);
    //console.log({ folder });

    if (!file) {
      throw new Error('No file provided');
    }

    const { filename, createReadStream } = await file; // Extract filename directly from the file object
    //console.log({ filename });
    //console.log({ createReadStream });
    // Check if the mimetype is valid (png, jpeg, jpg)
    const mimeTypes = {
      png: 'image/png',
      jpg: 'image/jpeg', // Corrected mime type for jpg
      jpeg: 'image/jpeg',
    };

    const getMimeType = (filename) => {
      const extension = filename.split('.').pop(); // Convert extension to lowercase for consistency
      return mimeTypes[extension];
    };
    /**
     ** Returns the mime type of a file based on its filename.
     * @param {string} filename - The filename of the file.
     * @returns {string} - The mime type of the file.
     */
    const mimeType = getMimeType(filename);

    const stream = createReadStream();

    // Create the S3 key for the uploaded file
    const key = `${folder}/${filename}`;
    //console.log({ key });
    try {
      // Create an upload stream to S3
      const uploadStream = await this.createUploadStream(key, mimeType);

      // Pipe the file read stream to the upload stream
      stream.pipe(uploadStream.writeStream);

      // Wait for the upload to finish and get the S3 location
      const result = await uploadStream.promise;

      //console.log({ result });

      return { uploaded: result.Location };
      // Return the uploaded object
    } catch (error) {
      console.error('Error uploading object:', error);
      return null;
    }
  }
  //add update
  async update(tablename, { input }) {
    //console.log({ input });
    const s3Client = this._pool;
    const objects = input.files.map((file) => {
      return { Key: file };
    });

    const command = new CopyObjectCommand({
      Bucket: this._bucket,
      CopySource: `${this._bucket}/${objects[0].Key}`,
      Key: objects[0].Key,
    });
    //todo: delete old file
    try {
      const { CopyObjectResult } = await s3Client.send(command);
      //console.log({ CopyObjectResult });
      return { updated: CopyObjectResult.LastModified };
    } catch (error) {
      logger.error('Error updating object:', error);
      return null;
    }
  }

  //add delete
  async delete(tablename, { input }) {
    //console.log({ input });
    const s3Client = this._pool;
    const objects = input.files.map((file) => {
      return { Key: file };
    });

    const command = new DeleteObjectsCommand({
      Bucket: this._bucket,
      Delete: {
        Objects: objects,
      },
    });

    try {
      const { Deleted } = await s3Client.send(command);
      //console.log({ Deleted });
      return { deleted: Deleted.map((file) => file.Key) };
    } catch (error) {
      logger.error('Error deleting object:', error);
      return null;
    }
  }
}
