import winston from 'winston';
import 'winston-mongodb';
import { MongoClient } from 'mongodb';

// destructuring needed properties
const { addColors, format, createLogger } = winston;
const { printf, colorize, combine, timestamp } = format;

/**
 * This function will configure all necessary transports
 * for logging to different destinations.
 * @returns {Array} an array containing all diferent ways of log
 */
const configureTransports = () => {
  const consoleTransport = new winston.transports.Console();
  const errorFileTransport = new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  });

  const allLogsFileTransport = new winston.transports.File({
    filename: 'logs/allLogs.log',
  });

  return [consoleTransport, errorFileTransport, allLogsFileTransport];
};

const configureLogger = () => {
  // define logging levels
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  };

  // colorizing logs enhances readability in the console
  const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
  };

  addColors(colors);

  // set the logging level based on the environment of the server
  const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';

    // if the server is on production will only show the warn and error msgs
    return isDevelopment ? 'debug' : 'warn';
  };

  // log format includes timestamp, log level and message
  // this is applied to all log messages

  const format = combine(
    // Add the message timestamp with the preferred format
    timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
    // Tell Winston that the logs must be colored
    colorize({ all: true }),
    // Define the format of the message showing the timestamp, the level and the message
    printf((info) => {
      const { timestamp, level, message, ip, url, method, requestBody, responseBody } = info;
      return `${timestamp} ${level}: ${message} - IP: ${ip}, URL: ${url}, Method: ${method}, Request Body: ${requestBody}, Response Body: ${responseBody}`;
    }),
  );

  const transports = configureTransports();

  return createLogger({
    level: level(),
    levels,
    format,
    transports,
  });
};

/**
 * This function will try to connect to mongodb atlas and if successful,
 * it will return the client connection
 * @returns {*} logger ready to use
 */
const connectToDB = async () => {
  try {
    // try to connect to the db
    const url = process.env.MONGODB_URL;
    const client = new MongoClient(url);
    await client.connect();
    return client;
  } catch (e) {
    throw new Error('Alguma coisa correu mal ao tentar conectar ao mongo. --', e.message);
  }
};

/**
 * This function will receive the mongodb client and will configure
 * the mongodb transports to use that client and set the collection
 * @param {*} client
 * @returns the mongodb transport
 */
const configureMongoDBTransport = async (client) => {
  // this will configure the transport to use with the db
  return new winston.transports.MongoDB({
    db: client,
    collection: 'logs',
  });
};

/**
 * This function will setup all the necessary configuration to make the logger ready for use through the api.
 * It will try to connect to the db to save logs and if successful will setup that transport and
 * add it to the logger config.
 * @returns will return the logger ready for use
 */
const setupLogger = async () => {
  const logger = configureLogger();

  logger.info('Connecting to mongodb for logs...');

  let mongodbTransport = null;

  try {
    const client = await connectToDB();

    // setup transport for mongodb
    mongodbTransport = await configureMongoDBTransport(client);
    logger.info('Connected successfully to mongodb');
  } catch (e) {
    logger.error('Failed to connect to MongoDB');
  }

  // if the mongo transport setup was successful we can add to the logger
  if (mongodbTransport) {
    logger.add(mongodbTransport);
  }

  return logger;
};

// Call the setupLogger function to obtain the configured logger and export it to use
// through our program
const logger = await setupLogger();

export default logger;
