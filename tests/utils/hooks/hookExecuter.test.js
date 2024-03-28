import { hookExecutor, beforeResolverRelations } from '../../../icarus-core/utils/hooks/beforeResolver/hookExecutor';

describe('hookExecutor', () => {
  it('should return properties without modification if no hook is defined', async () => {
    const table = { hooks: {} };
    const operation = 'query';
    const hook = 'beforeResolver';
    const properties = { arg1: 'value1', arg2: 'value2' };

    const result = await hookExecutor(table, operation, hook, properties);

    expect(result).toEqual(properties);
  });

  it('should execute the specified hook and return modified properties', async () => {
    // Mock a hook function
    const mockHookFunction = jest.fn((properties) => Object.assign({}, properties, { modified: true }));

    // Define the hook in the table object
    const table = {
      hooks: {
        all: {
          beforeResolver: mockHookFunction,
        },
      },
    };

    const operation = 'query';
    const hook = 'beforeResolver';
    const properties = { arg1: 'value1', arg2: 'value2' };

    const result = await hookExecutor(table, operation, hook, properties);

    // Ensure the hook function was called with the correct arguments
    expect(mockHookFunction).toHaveBeenCalledWith(properties);

    // Ensure the returned properties are modified
    expect(result).toEqual({ arg1: 'value1', arg2: 'value2', modified: true });
  });
});

describe('beforeResolverRelations', () => {
  it('should modify args for MongoDB type', async () => {
    const table = { database: { type: 'mongodb' } };
    const args = { input: {}, take: 10, skip: 5 };
    const column = { name: 'parentId', foreignKey: 'parent_id' };
    const parent = { parentId: '123' };

    const result = await beforeResolverRelations(table, args, column, parent);

    expect(result).toEqual({
      input: { filter: { _and: [{ parent_id: { _eq: '123' } }] }, take: 10, skip: 5 },
    });
  });

  it('should modify args for MySQL type', async () => {
    const table = { database: { type: 'mysql' } };
    const args = { input: {} };
    const column = { name: 'parentId', foreignKey: 'parent_id' };
    const parent = { parent_id: '456' };

    const result = await beforeResolverRelations(table, args, column, parent);

    expect(result).toEqual({
      input: { filter: { parent_id: '456' } },
    });
  });
});
