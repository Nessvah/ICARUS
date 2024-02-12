import fs from 'node:fs';
import { MongoClient } from 'mongodb';

const accessLogStream = fs.createWriteStream('./access.log', { flags: 'a' });

// Custom stream for morgan to write logs in mongodb

class MongoDBStream {
  constructor() {
    this.mongoClient = new MongoClient(process.env.MONGODB_URL);
    this.mongoClient.connect();
    this.db = this.mongoClient.db('logs');
    this.collection = this.db.collection('http-req');
  }

  write(log) {
    try {
      console.log(log);
      // extract relevant information from the log data
      // const logData = JSON.parse(log);
      // this.collection.insertOne(logData);
    } catch (e) {
      console.error(e);
    }
  }
}

export { MongoDBStream, accessLogStream };
