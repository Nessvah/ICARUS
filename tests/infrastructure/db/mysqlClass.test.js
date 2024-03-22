import { MySQLConnection } from '../../../icarus-core/infrastructure/db/mysqlClass';
import { logger } from '../../../icarus-core/infrastructure/server';

// Mock the ImportThemTities class
jest.mock('../../../icarus-core/config/importDemTities.js', () => ({
  ImportThemTities: jest.fn().mockImplementation(() => ({
    // Mock the importAll method
    importAll: jest.fn().mockResolvedValue({
      tables: [], // Mock the tables array
      connections: [], // Mock the connections array
    }),
  })),
}));

jest.mock('../../../icarus-core/infrastructure/server', () => ({
  logger: {
    warn: jest.fn(),
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

// Mock MySQL pool object
const pool = {
  getConnection: jest.fn(),
};

// Mock currentTableInfo object
const currentTableInfo = {
  table: 'testTable',
  pool: pool,
};

// MySQLConnection object for testing
const mySQLConnection = new MySQLConnection(currentTableInfo);

describe('MySQLConnection', () => {
  describe('getConnection', () => {
    it('should log a warning message when getting a connection', async () => {
      await mySQLConnection.getConnection();
      expect(logger.warn).toHaveBeenCalledWith('getting mysql conn from pool...');
    });

    it('should return a connection from the pool', async () => {
      const connection = {};
      pool.getConnection.mockResolvedValueOnce(connection);

      const result = await mySQLConnection.getConnection();
      expect(result).toBe(connection);
    });
  });
});
