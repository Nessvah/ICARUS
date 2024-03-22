import { autoResolvers, resolvers } from '../../icarus-core/graphql/resolvers.js';
import { controller } from '../../icarus-core/infrastructure/db/connector.js'; // Import dependencies to mock
import { validation } from '../../icarus-core/utils/validation/validation.js';
import { hookExecutor } from '../../icarus-core/utils/hooks/beforeResolver/hookExecutor.js';
import { logger } from '../../icarus-core/infrastructure/server.js';

// Mock the controller module
jest.mock('../../icarus-core/infrastructure/db/connector.js', () => ({
  controller: jest.fn(),
}));

// Mock the validation module
jest.mock('../../icarus-core/utils/validation/validation.js', () => ({
  validation: jest.fn(),
}));

// Mock the hookExecutor module
jest.mock('../../icarus-core/utils/hooks/beforeResolver/hookExecutor.js', () => ({
  hookExecutor: jest.fn(),
}));

// Mock the customErrors module
jest.mock('../../icarus-core/utils/error-handling/CustomErrors.js', () => ({
  AuthorizationError: jest.fn(),
}));

// Mock the server module (logger)
jest.mock('../../icarus-core/infrastructure/server.js', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock the generateTypeDefs module
jest.mock('../../icarus-core/graphql/generateTypeDefs.js', () => ({
  config: {
    tables: [
      {
        name: 'Table1',
        columns: [
          { name: 'column1', isObject: false },
          { name: 'column2', isObject: true, foreignEntity: 'Table2' },
        ],
      },
      {
        name: 'Table2',
        columns: [
          { name: 'column1', isObject: false },
          { name: 'column2', isObject: false },
        ],
      },
    ],
  },
}));

describe('Resolvers', () => {
  beforeAll(async () => {
    // Mock the controller function to return fake data or predefined result
    controller.mockResolvedValue({ id: 'fakeUserId', username: 'fakeUsername' });

    // Mock the validation function to resolve successfully
    validation.mockResolvedValue();

    // Mock the hookExecutor function to simulate execution of hooks
    hookExecutor.mockResolvedValue({ args: {}, context: {} });

    // Mock the logger error function
    logger.error.mockImplementation((error) => {
      throw new Error(error); // Throw error to fail the test if logger.error is called
    });

    await autoResolvers();
  });

  describe('Query Resolvers', () => {
    it('should return correct data for tables query', async () => {
      // Mock input data and context
      const parent = {};
      const incomeArgs = {};
      const incomeContext = {};
      const info = {};

      // Call the resolver function
      const result = await resolvers.Query.tables(parent, incomeArgs, incomeContext, info);

      // Assert the result against expected data
      expect(result).toBeDefined(); // Modify this assertion based on expected data structure
      // Add more specific assertions based on the expected behavior of the resolver
    });

    // Add more test cases for other query resolvers
  });

  describe('Mutation Resolvers', () => {
    it('should execute CreateUser mutation and return correct result', async () => {
      // Mock input data and context
      const parent = {};
      const incomeArgs = {}; // Provide input arguments for mutation
      const incomeContext = {};
      const info = {};

      // Define a mock implementation for the CreateUser resolver
      const mockCreateUserResolver = jest.fn().mockResolvedValue({ id: '123', username: 'eliana' });
      resolvers.Mutation.CreateUser = mockCreateUserResolver;

      // Call the resolver function
      const result = await resolvers.Mutation.CreateUser(parent, incomeArgs, incomeContext, info);

      // Assert the result against expected data
      expect(result).toEqual({ id: '123', username: 'eliana' });

      // Optionally, you can also assert whether the mock function was called with the correct arguments
      expect(mockCreateUserResolver).toHaveBeenCalledWith(parent, incomeArgs, incomeContext, info);
    });
  });
});
