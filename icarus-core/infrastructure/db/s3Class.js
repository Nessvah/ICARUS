import stream from 'stream';
import { S3, ListObjectsV2Command, CopyObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
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
   ** Processes a filter object and returns a filtered list of objects.
   *
   * @param {object} input - The input filter object.
   * @returns {object[]} - A list of filtered objects.
   */
  async processFilter(input) {
    // Check if input is empty or null, return all objects if true
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

  /**
   ** Returns the mime type of a file based on its filename.
   * @param {string} filename - The filename of the file.
   * @returns {string} - The mime type of the file.
   */
  getMimeType(filename) {
    // Check if the mimetype is valid (png, jpeg, jpg)
    const mimeTypes = {
      png: 'image/png',
      jpg: 'image/jpeg', // Corrected mime type for jpg
      jpeg: 'image/jpeg',
    };

    const extension = filename.split('.').pop(); // Convert extension to lowercase for consistency
    return mimeTypes[extension] || 'application/octet-stream'; // Default to octet-stream if not found
  }

  /**
   ** Returns a list of objects in an S3 bucket.
   *
   * @param {object} input - The input object containing filter options.
   * @param {string} input.bucket - The name of the S3 bucket.
   * @param {string} [input.directory] - The directory within the S3 bucket to search.
   * @param {string} [input.name] - The name of the object to search for within the directory.
   * @returns {object[]} - A list of objects in the S3 bucket.
   */
  async find(_, { input }) {
    //console.log({ input });
    try {
      const filter = await this.processFilter(input.filter);

      // Construct the S3 command to list objects in the bucket
      let command = new ListObjectsV2Command({
        Bucket: this._bucket,
      }); // Create ListObjectsCommand instance
      await this._pool.send(command); // Execute the command

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

      //console.log({ files });
      return files; // Return both directories and files
    } catch (error) {
      console.error('Error reading object:', error);
      return null;
    }
  }

  /**
   ** Creates an S3 upload stream.
   *
   * @param {string} key - The S3 key of the object to upload.
   * @param {string} mimeType - The MIME type of the object.
   * @returns {{key: string, writeStream: stream.PassThrough, promise: Promise<S3.Types.UploadOutput>}}
   * A key-value pair containing the S3 key, a writable stream, and a promise that resolves to the S3 upload output.
   */
  async createUploadStream(key, mimeType) {
    // Create a writable stream for S3 upload
    const pass = new stream.PassThrough();

    // Initialize S3 upload instance
    const upload = new Upload({
      client: this._pool,
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

  /**
   ** Processes an upload request.
   *
   * @param {object} input - The input object containing the file and folder information.
   * @param {object} input._upload - The upload information.
   * @param {File} input._upload.file - The file to upload.
   * @param {string} input._upload.folder - The folder to upload the file to.
   * @returns {object} - The response object containing the uploaded file information.
   */
  async upload(_, { input }) {
    // Extract the file and folder information from the input
    const { file } = input._upload.file;
    const folder = input._upload.directory.toLowerCase();

    // Check if a file was provided
    if (!file) {
      throw new Error('No file provided');
    }

    // Extract the filename and read stream from the file
    const { filename, createReadStream } = await file; // Extract filename directly from the file object

    /**
     ** Returns the mime type of a file based on its filename.
     * @param {string} filename - The filename of the file.
     * @returns {string} - The mime type of the file.
     */
    const mimeType = this.getMimeType(filename);

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

      return { uploaded: { data: result.Location } };
      // Return the uploaded object
    } catch (error) {
      console.error('Error uploading object:', error);
      return null;
    }
  }

  /**
   ** Processes an update request for objects in an S3 bucket.
   *
   * @param {object} _ - Unused parameter (convention for GraphQL resolver functions).
   * @param {object} input - The input object containing the update information.
   * @param {string} input._update.directory - The directory to move the object to.
   * @param {string} input._update.name - The new name of the object.
   * @param {object} [input._update.filter] - Optional filter object to search for the object to update.
   * @returns {object|null} - The response object containing the updated object information, or null if an error occurs.
   */
  async update(_, { input }) {
    try {
      // Extract directory and name from the input object.
      const directory = input._update.directory;
      const name = input._update.name;

      // Check if both directory and name are provided.
      if (!directory || !name) {
        throw new Error('Both directory and file name must be provided');
      }

      // Process the filter to obtain the object to update.
      const filterResults = await this.processFilter(input._update.filter);

      // If no matching objects found, throw an error.
      if (!filterResults || filterResults.length === 0) {
        throw new Error('No matching objects found for update');
      }

      // Get the key of the object to update.
      const objectKey = filterResults[0].Key;

      // Generate the new key based on the directory and name.
      const newKey = `${directory}/${name}.${objectKey.split('.').pop()}`;

      // Copy the object to the new key.
      const copy = new CopyObjectCommand({
        Bucket: this._bucket,
        CopySource: `${this._bucket}/${objectKey}`,
        Key: newKey,
      });
      await this._pool.send(copy);

      // Delete the original object.
      const uncreate = new DeleteObjectsCommand({
        Bucket: this._bucket,
        Delete: {
          Objects: [{ Key: objectKey }],
          Quiet: false,
        },
      });
      await this._pool.send(uncreate);

      // List objects in the bucket.
      let list = new ListObjectsV2Command({
        Bucket: this._bucket,
      });
      await this._pool.send(list);

      let updatedFiles = [];

      // If filter results exist, update files array with metadata.
      if (filterResults) {
        updatedFiles = filterResults.map((content) => {
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

      // Return the response object containing the updated files.
      return { updated: updatedFiles };
    } catch (error) {
      // Log the error if one occurs.
      logger.error('Error updating object:', error);
      // Return null to indicate an error occurred.
      return null;
    }
  }

  /**
   ** Processes a delete request for objects in an S3 bucket.
   *
   * @param {object} _ - Unused parameter (convention for GraphQL resolver functions).
   * @param {object} input - The input object containing the delete information.
   * @param {string} input._delete.directory - The directory from which to delete the object.
   * @param {string} input._delete.name - The name of the object to delete.
   * @param {object} [input._delete.filter] - Optional filter object to narrow down the deletion scope.
   * @returns {object|null} - The response object containing the number of deleted objects, or null if an error occurs.
   */
  async delete(_, { input }) {
    try {
      // Process the filter to obtain the objects to delete.
      const filterResults = await this.processFilter(input._delete.filter);

      // If no matching objects found, throw an error.
      if (!filterResults || filterResults.length === 0) {
        throw new Error('No matching objects found for deletion');
      }

      // Extract Keys of objects to delete.
      const objectsToDelete = filterResults.map((content) => ({ Key: content.Key }));

      // Construct the DeleteObjectsCommand.
      const command = new DeleteObjectsCommand({
        Bucket: this._bucket,
        Delete: {
          Objects: objectsToDelete,
          Quiet: false, // Specify whether to return information about the deleted objects
        },
      });

      // Send the delete command and retrieve the list of deleted objects.
      const { Deleted } = await this._pool.send(command);

      // Return the response object containing the number of deleted objects.
      return { deleted: Deleted.length };
    } catch (error) {
      // Log the error if one occurs.
      logger.error('Error deleting object:', error);
      // Return null to indicate an error occurred.
      return null;
    }
  }

  /**
   * *Counts the number of objects in an S3 bucket that match a given filter.
   *
   * @param {object} _ - Unused parameter (convention for GraphQL resolver functions).
   * @param {object} input - The input object containing filter options.
   * @param {object} input.filter - The filter object to apply for object matching.
   * @returns {number|null} - The number of objects matching the filter, or null if an error occurs.
   */
  async count(_, { input }) {
    try {
      // Process the filter to obtain the matching objects.
      const filterResults = await this.processFilter(input.filter);

      // Return the number of objects that match the filter.
      return filterResults.length;
    } catch (error) {
      // Log the error if one occurs.
      logger.error('Error counting objects:', error);
      // Return null to indicate an error occurred.
      return null;
    }
  }
}
