import { MongoDBConnection } from '../../../icarus-core/infrastructure/db/mongodbClass';
import { logger } from '../../../icarus-core/infrastructure/server';

// Mock logger
jest.mock('../../../icarus-core/infrastructure/server', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock the generateTypeDefs.js file
jest.mock('../../../icarus-core/graphql/generateTypeDefs.js', () => ({
  config: {
    // Mock the behavior of import.meta.url
    __dirname: '/ICARUS/icarus-core/graphql',
  },
}));

// Mock MongoDB pool object
const pool = {
  connect: jest.fn(),
  close: jest.fn(),
  db: jest.fn(),
};

// Mock currentTableInfo object
const currentTableInfo = {
  table: 'testTable',
  type: 'mongo',
  databaseName: 'testDB',
  columns: {},
  pool: pool,
};

// MongoDBConnection object for testing
const mongoDBConnection = new MongoDBConnection(currentTableInfo);

describe('MongoDBConnection', () => {
  // CONNECTION

  describe('connect', () => {
    it('should connect to the MongoDB database', async () => {
      await mongoDBConnection.connect();
      expect(pool.connect).toHaveBeenCalled();
    });

    it('should log an error if connection fails', async () => {
      pool.connect.mockRejectedValueOnce(new Error('Connection error'));
      await mongoDBConnection.connect();
      expect(logger.error).toHaveBeenCalledWith('Error to connect to MongoDB:', new Error('Connection error'));
    });
  });

  // Test the close method
  describe('close', () => {
    it('should close the connection to the MongoDB database', async () => {
      await mongoDBConnection.close();
      expect(pool.close).toHaveBeenCalled();
    });

    it('should log an error if closing connection fails', async () => {
      pool.close.mockRejectedValueOnce(new Error('Close connection error'));
      await mongoDBConnection.close();
      expect(logger.error).toHaveBeenCalledWith(
        'Error closing MongoDB connection:',
        new Error('Close connection error'),
      );
    });
  });
});
