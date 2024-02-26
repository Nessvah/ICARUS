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
  //const consoleTransport = new winston.transports.Console();
  const consoleTransport = new winston.transports.Console();
  const errorFileTransport = new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  });

  const allLogsFileTransport = new winston.transports.File({
    filename: 'logs/allLogs.log',
    level: 'http',
  });

  return [consoleTransport, errorFileTransport, allLogsFileTransport];
};

const configureLogger = () => {
  // define logging levels
  const levels = {
    error: 0,
    warn: 1,
    http: 2,
    info: 3,
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
    //! colorize doesn't work properly with json format and will crash if we try
    colorize({ all: true }),
    // Define the format of the message showing the timestamp, the level and the message
    printf((info) => {
      const { timestamp, level, message, ip, url, method } = info;
      return `${timestamp} ${level}: ${message} - IP: ${ip}, URL: ${url}, Method: ${method}.`;
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
 * If the connection to the db fails, it will retry to reconnect 3x .
 * This will initialize the logger when the module is imported to other parts.
 * @returns will return the logger ready for use otherwise will exit the process for misconfiguration
 */

const initializeLogger = (async () => {
  // define max retires and counter
  const max_retries = 3;
  let retry_count = 0;

  while (retry_count < max_retries) {
    try {
      const logger = configureLogger();

      logger.info('Connecting to mongodb for logs...');

      const client = await connectToDB();

      // setup transport for mongodb
      const mongodbTransport = await configureMongoDBTransport(client);
      logger.debug('Connected successfully to mongodb');

      /// add the mongo transport to the setup
      logger.add(mongodbTransport);
      return logger;
    } catch (e) {
      console.error('Failed to connect to MongoDB');

      // increment counter for the retries
      retry_count++;

      // create a small delay of 2s between retries
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // if all attempts to connect fail, log an error and exit the app
  console.error('Failed to connect to MongoDB after all the retries.');

  //? ask for victors opinion on explicitly exiting app
  // the 1 + code means that the app stoped due to an error
})();

export default initializeLogger;
