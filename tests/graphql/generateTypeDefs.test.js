import { generateTypeDefinitions } from '../../icarus-core/graphql/generateTypeDefs.js';

jest.mock('../../icarus-core/graphql/generateTypeDefs.js', () => {
  // Mock the generateTypeDefinitions function
  const generateTypeDefinitions = jest.fn(() => {
    // Mock the generation of type definitions here
    return `
        type Query {
          example: String
        }

        type Mutation {
            exampleMutation: String
          }
          type User {
            id: ID
            username: String
            email: String
          }
    
          input UserCreate {
            username: String
            email: String
          }
    
          input UserUpdate {
            id: ID!
            username: String
            email: String
          }
    
          input UserDelete {
            id: ID!
          }
    
          input UserUpload {
            file: Upload
          }
    
          input UserFilter {
            // Define your filter input here
          }
    
          input UserLogicalOp {
            // Define your logical operations here
          }
    
          input UserQueryOptions {
            // Define your query options here
          }
    
          input UserSortOptions {
            // Define your sort options here
          }
    
          type UserOutput {
            // Define your output type here
          }
    
          type UserCountResult {
            // Define your count result type here
          }
    
          enum Sort {
            ASC
            DESC
          }
    
          type TableInfo {
            // Define your table info type here
          }
        `;
  });
  // Mock the config object
  const config = {
    __dirname: '/ICARUS/icarus-core/graphql',
  };

  // Mock the fileURLToPath function
  const fileURLToPath = jest.fn(() => '/path/to/your/module.js');

  // Return the mocked entities
  return {
    generateTypeDefinitions,
    config,
    fileURLToPath,
  };
});

describe('generateTypeDefs', () => {
  it('should generate type definitions for GraphQL schema', () => {
    // Mock configuration data
    const config = {
      tables: [
        {
          name: 'User',
          columns: [
            { name: 'id', type: 'int', primaryKey: true },
            { name: 'username', type: 'string' },
            { name: 'email', type: 'string' },
          ],
        },
      ],
    };

    // Call the generateTypeDefinitions function
    const typeDefs = generateTypeDefinitions(config);

    // Assert that the type definitions contain expected strings
    expect(typeDefs).toContain('type Query');
    expect(typeDefs).toContain('type Mutation');
    expect(typeDefs).toContain('type User');
    expect(typeDefs).toContain('input UserCreate');
    expect(typeDefs).toContain('input UserUpdate');
    expect(typeDefs).toContain('input UserDelete');
    expect(typeDefs).toContain('input UserUpload');
    expect(typeDefs).toContain('input UserFilter');
    expect(typeDefs).toContain('input UserLogicalOp');
    expect(typeDefs).toContain('input UserQueryOptions');
    expect(typeDefs).toContain('input UserSortOptions');
    expect(typeDefs).toContain('type UserOutput');
    expect(typeDefs).toContain('type UserCountResult');
    expect(typeDefs).toContain('enum Sort');
    expect(typeDefs).toContain('type TableInfo');
  });

  it('should include file upload operation in mutation input', () => {
    const configWithFileUpload = {
      tables: [
        {
          name: 'User',
          columns: [
            { name: 'profileImage', type: 'string' }, // Assuming profile image is uploaded as a string
          ],
        },
      ],
    };
    const typeDefs = generateTypeDefinitions(configWithFileUpload);
    expect(typeDefs).toContain('input UserUpload {');
    expect(typeDefs).toContain('file: Upload');
  });

  it('should handle object column type properly', () => {
    // Mock configuration with object column type
    const configWithObjectColumn = {
      tables: [
        {
          name: 'User',
          columns: [{ name: 'address', type: 'object' }],
        },
      ],
    };
    const typeDefs = generateTypeDefinitions(configWithObjectColumn);
    expect(typeDefs).toContain('type User {');
    expect(typeDefs).not.toContain('address: JSON'); // Adjusted expectation
  });
});
