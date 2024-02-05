import { MongoClient } from 'mongodb';
import initializeLogger from './winstonConfig.js';

// Custom stream for morgan to write logs in mongodb

class MongoDBStream {
  constructor() {
    this.mongoClient = new MongoClient(process.env.MONGODB_URL);
    this.db = null;
    this.collection = null;

    // this will ensure that the connection is established before
    // using the mongo stream for the logs
    this.init();
  }

  // initiate the connection to the mongodb
  async init() {
    try {
      await this.mongoClient.connect();
      this.db = this.mongoClient.db('icarus-logs');
      this.collection = this.db.collection('http-req');
    } catch (e) {
      initializeLogger.error('Error connecting to the MongoDB: ', e.message);
    }
  }

  async write(log) {
    try {
      if (this.collection) {
        initializeLogger.info(log, 'log');
        // this.collection.insertOne(log)
      }
    } catch (e) {
      initializeLogger.error('Error while writing log to MongoDB Stream: ', e.message);
    }
  }

  async disconnect() {
    try {
      if (this.mongoClient.isConnected()) {
        await this.mongoClient.close();
        initializeLogger.info('Disconnected from MongoDB');
      }
    } catch (e) {
      initializeLogger.error('Error while trying to disconnect from MongoDB Stream: ', e.message);
    }
  }
}

export { MongoDBStream };
