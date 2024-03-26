import { controller, createDbPool } from '../../../icarus-core/infrastructure/db/connector';
import { MongoDBConnection } from '../../../icarus-core/infrastructure/db/mongodbClass';
import { MySQLConnection } from '../../../icarus-core/infrastructure/db/mysqlClass';
import { logger } from '../../../icarus-core/infrastructure/server';

// Mock logger
jest.mock('../../../icarus-core/infrastructure/server', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock config data
jest.mock('../../../icarus-core/graphql/generateTypeDefs', () => ({
  config: {
    tables: [
      {
        name: 'collection1',
        database: {
          type: 'mongodb',
          uri: 'mongodb://localhost:27017',
          databaseName: 'testdb',
        },
        columns: [],
      },
      {
        name: 'users',
        database: {
          type: 'mysql',
          host: 'localhost',
          user: 'root',
          password: 'password',
          databaseName: 'testdb',
          port: 3306,
        },
        columns: [],
      },
    ],
  },
}));

describe('controller function', () => {
  beforeEach(async () => {
    // Clear mocks and reset pools array before each test
    await createDbPool();
  });

  // FIND METHOD

  test('should create MongoDB connection and call find method', async () => {
    // Mock MongoDBConnection find method
    MongoDBConnection.prototype.find = jest.fn().mockResolvedValue('MongoDB find result');

    const args = { input: { filter: {} } };
    const result = await controller('collection1', args);

    expect(MongoDBConnection.prototype.find).toHaveBeenCalledWith('collection1', args);
    expect(result).toBe('MongoDB find result');
  });

  test('should create MySQL connection and call find method', async () => {
    // Mock MySQLConnection find method
    MySQLConnection.prototype.find = jest.fn().mockResolvedValue('MySQL find result');

    const args = { input: { filter: {} } };
    const result = await controller('users', args);

    expect(MySQLConnection.prototype.find).toHaveBeenCalledWith('users', args);
    expect(result).toBe('MySQL find result');
  });

  test('should log error when controller function encounters an error', async () => {
    // Mock MongoDBConnection find method to throw an error
    MongoDBConnection.prototype.find = jest.fn().mockRejectedValue(new Error('MongoDB connection error'));

    const args = { input: { filter: {} } };
    await controller('collection1', args);

    expect(logger.error).toHaveBeenCalledWith(new Error('MongoDB connection error'));
  });

  test('should log error when MySQL connection encounters an error', async () => {
    // Mock MySQLConnection find method to throw an error
    MySQLConnection.prototype.find = jest.fn().mockRejectedValue(new Error('MySQL connection error'));

    const args = { input: { filter: {} } };
    await controller('users', args);

    expect(logger.error).toHaveBeenCalledWith(new Error('MySQL connection error'));
  });

  // CREATE METHOD

  /* missing create method test - to do later  */

  test('should log error when MongoDB create method encounters an error', async () => {
    // Mock MongoDBConnection create method to throw an error
    MongoDBConnection.prototype.create = jest.fn().mockRejectedValue(new Error('MongoDB create error'));

    const args = { input: { _create: { name: 'John', email: 'john@example.com' } } };
    await controller('collection1', args);

    expect(logger.error).toHaveBeenCalledWith(new Error('MongoDB create error'));
  });

  test('should log error when MySQL create method encounters an error', async () => {
    // Mock MySQLConnection create method to throw an error
    MySQLConnection.prototype.create = jest.fn().mockRejectedValue(new Error('MySQL create error'));

    const args = { input: { _create: { name: 'John', email: 'john@example.com' } } };
    await controller('users', args);

    expect(logger.error).toHaveBeenCalledWith(new Error('MySQL create error'));
  });

  // UPDATE METHOD

  test('should create MongoDB connection and call update method', async () => {
    // Mock MongoDBConnection _update method
    MongoDBConnection.prototype.update = jest.fn().mockResolvedValue('Updated document');

    const args = { input: { _update: { id: '123', data: { name: 'New Name' } } } };
    const result = await controller('collection1', args);

    expect(MongoDBConnection.prototype.update).toHaveBeenCalledWith('collection1', args);
    expect(result).toBe('Updated document');
  });

  test('should create MySQL connection and call update method', async () => {
    // Mock MySQLConnection update method
    MySQLConnection.prototype.update = jest.fn().mockResolvedValue('Updated user');

    const args = { input: { _update: { id: '123', data: { name: 'New Name' } } } };
    const result = await controller('users', args);

    expect(MySQLConnection.prototype.update).toHaveBeenCalledWith('users', args);
    expect(result).toBe('Updated user');
  });

  test('should log error when MongoDB update method encounters an error', async () => {
    // Mock MongoDBConnection update method to throw an error
    MongoDBConnection.prototype.update = jest.fn().mockRejectedValue(new Error('MongoDB update error'));

    const args = { input: { _update: { id: '123', data: { name: 'New Name' } } } };
    await controller('collection1', args);

    expect(logger.error).toHaveBeenCalledWith(new Error('MongoDB update error'));
  });

  test('should log error when MySQL update method encounters an error', async () => {
    // Mock MySQLConnection update method to throw an error
    MySQLConnection.prototype.update = jest.fn().mockRejectedValue(new Error('MySQL update error'));

    const args = { input: { _update: { id: '123', data: { name: 'New Name' } } } };
    await controller('users', args);

    expect(logger.error).toHaveBeenCalledWith(new Error('MySQL update error'));
  });

  // DELETE METHOD

  test('should create MySQL connection and call delete method', async () => {
    // Mock MySQLConnection _delete method
    MySQLConnection.prototype.delete = jest.fn().mockResolvedValue('Deleted user');

    const args = { input: { _delete: { id: '123' } } };
    const result = await controller('users', args);

    expect(MySQLConnection.prototype.delete).toHaveBeenCalledWith('users', args);
    expect(result).toBe('Deleted user');
  });

  test('should create MongoDB connection and call delete method', async () => {
    // Mock MongoDBConnection delete method
    MongoDBConnection.prototype.delete = jest.fn().mockResolvedValue('Deleted document');

    const args = { input: { _delete: { id: '123' } } };
    const result = await controller('collection1', args);

    expect(MongoDBConnection.prototype.delete).toHaveBeenCalledWith('collection1', args);
    expect(result).toBe('Deleted document');
  });

  test('should log error when MySQL delete method encounters an error', async () => {
    // Mock MySQLConnection delete method to throw an error
    MySQLConnection.prototype.delete = jest.fn().mockRejectedValue(new Error('MySQL delete error'));

    const args = { input: { _delete: { id: '123' } } };
    await controller('users', args);

    expect(logger.error).toHaveBeenCalledWith(new Error('MySQL delete error'));
  });

  test('should log error when MongoDB delete method encounters an error', async () => {
    // Mock MongoDBConnection delete method to throw an error
    MongoDBConnection.prototype.delete = jest.fn().mockRejectedValue(new Error('MongoDB delete error'));

    const args = { input: { _delete: { id: '123' } } };
    await controller('collection1', args);

    expect(logger.error).toHaveBeenCalledWith(new Error('MongoDB delete error'));
  });

  // COUNT METHOD

  test('should create MongoDB connection and call count method', async () => {
    // Mock MongoDBConnection _count method
    MongoDBConnection.prototype.count = jest.fn().mockResolvedValue(5);

    const args = { input: { _count: {} } };
    const result = await controller('collection1', args);

    expect(MongoDBConnection.prototype.count).toHaveBeenCalledWith('collection1', args);
    expect(result).toBe(5);
  });

  test('should create MySQL connection and call count method', async () => {
    // Mock MySQLConnection count method
    MySQLConnection.prototype.count = jest.fn().mockResolvedValue(10);

    const args = { input: { _count: {} } };
    const result = await controller('users', args);

    expect(MySQLConnection.prototype.count).toHaveBeenCalledWith('users', args);
    expect(result).toBe(10);
  });

  test('should log error when MongoDB count method encounters an error', async () => {
    // Mock MongoDBConnection count method to throw an error
    MongoDBConnection.prototype.count = jest.fn().mockRejectedValue(new Error('MongoDB count error'));

    const args = { input: { _count: {} } };
    await controller('collection1', args);

    expect(logger.error).toHaveBeenCalledWith(new Error('MongoDB count error'));
  });

  test('should log error when MySQL count method encounters an error', async () => {
    // Mock MySQLConnection count method to throw an error
    MySQLConnection.prototype.count = jest.fn().mockRejectedValue(new Error('MySQL count error'));

    const args = { input: { _count: {} } };
    await controller('users', args);

    expect(logger.error).toHaveBeenCalledWith(new Error('MySQL count error'));
  });

  // FILTER METHOD

  test('should filter records from MongoDB', async () => {
    // Mock MongoDBConnection find method
    MongoDBConnection.prototype.find = jest.fn().mockResolvedValue(['Record1', 'Record2']);

    const args = {
      input: {
        filter: { name: 'John' }, // Example filter criteria
      },
    };

    const result = await controller('collection1', args);
    expect(MongoDBConnection.prototype.find).toHaveBeenCalledWith('collection1', args);
    expect(result).toEqual(['Record1', 'Record2']);
  });

  test('should filter records from MySQL', async () => {
    // Mock MySQLConnection find method
    MySQLConnection.prototype.find = jest.fn().mockResolvedValue(['Record1', 'Record2']);

    const args = {
      input: {
        filter: { name: 'John' }, // Example filter criteria
      },
    };

    const result = await controller('users', args);
    expect(MySQLConnection.prototype.find).toHaveBeenCalledWith('users', args);
    expect(result).toEqual(['Record1', 'Record2']);
  });
});
