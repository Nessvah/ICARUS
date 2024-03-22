import * as afterResolverMongoDBModule from '../../../icarus-core/utils/hooks/afterResolver/afterResolverMongoDB.js';
import * as afterResolverMySQLModule from '../../../icarus-core/utils/hooks/afterResolver/afterResolverMySQL.js';
import { afterResolver } from '../../../icarus-core/utils/hooks/afterResolver/afterResolver.js';

describe('afterResolver', () => {
  it('should return modified responses for MongoDB', () => {
    // Mock input responses
    const res = [{ prop1: 'value1' }, { prop2: 'value2' }];
    const dbName = 'mongodb';

    // Mock the MongoDB afterResolver function
    jest
      .spyOn(afterResolverMongoDBModule, 'afterResolverMongoDB')
      .mockReturnValue([{ modified: true }, { modified: true }]);

    // Call the afterResolver function
    const result = afterResolver(res, dbName);

    // Ensure the MongoDB afterResolver function was called with the correct arguments
    expect(afterResolverMongoDBModule.afterResolverMongoDB).toHaveBeenCalledWith(res);

    // Ensure the result is the modified responses
    expect(result).toEqual([{ modified: true }, { modified: true }]);

    // Restore the mock implementation
    afterResolverMongoDBModule.afterResolverMongoDB.mockRestore();
  });

  it('should return modified responses for MySQL', () => {
    // Mock input responses
    const res = [{ prop1: 'value1' }, { prop2: 'value2' }];
    const dbName = 'mysql';

    // Mock the MySQL afterResolver function
    jest
      .spyOn(afterResolverMySQLModule, 'afterResolverMySQL')
      .mockReturnValue([{ modified: true }, { modified: true }]);

    // Call the afterResolver function
    const result = afterResolver(res, dbName);

    // Ensure the MySQL afterResolver function was called with the correct arguments
    expect(afterResolverMySQLModule.afterResolverMySQL).toHaveBeenCalledWith(res);

    // Ensure the result is the modified responses
    expect(result).toEqual([{ modified: true }, { modified: true }]);

    // Restore the mock implementation
    afterResolverMySQLModule.afterResolverMySQL.mockRestore();
  });
});
