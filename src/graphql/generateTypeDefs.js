import fs from 'fs';
import { logger } from '../infrastructure/server.js';

import { GraphQLString, GraphQLInt, GraphQLFloat, GraphQLNonNull, GraphQLBoolean, GraphQLID } from 'graphql';
import { MySQLDate, GraphQLDate } from './customScalars.js';
import { GraphQLJSON } from 'graphql-type-json';

import { ImportThemTities } from '../config/importDemTities.js';
// Call the importAll method to start importing entities
const importer = new ImportThemTities();

/**
 ** Reads the config files and returns the parsed data.
 * @param {string} filePath - The path to the file.
 * @returns {object} The parsed JSON data or null if an error occurs.
 */
const readConfigFile = async () => {
  try {
    const config = await importer.importAll(); // Await the result of importAll()

    if (config && config.tables) {
      // Ensure config.tables is defined
      //console.log('Config:', config, '______________'); // Log the retrieved config
      return config;
    } else {
      logger.error('Config data is missing or incomplete.');
      return null;
    }
  } catch (error) {
    logger.error('Error reading config file:', error);
    return null;
  }
};

//console.log(await readConfigFile());
/**
 ** Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
/**
 ** Maps a database column type to a GraphQL type.
 * @param {string} columnType - The database column type.
 * @returns {GraphQLType} The GraphQL type.
 */
const mapColumnTypeToGraphQLType = (columnType) => {
  switch (columnType.toLowerCase()) {
    case 'int':
    case 'number':
      return GraphQLInt;
    case 'varchar':
    case 'string':
      return GraphQLString;
    case 'decimal':
    case 'float':
      return GraphQLFloat;
    case 'boolean':
      return GraphQLBoolean;
    case 'id':
      return GraphQLID;
    case 'timestamp':
      return MySQLDate;
    case 'date':
      return GraphQLDate;
    case 'object':
    case 'array':
      return GraphQLJSON;
    default:
      throw new Error(`Unsupported column type: ${columnType}`);
  }
};

/**
 ** Generates the type definitions for the GraphQL schema.
 * @param {object} config - The configuration data.
 * @returns {string} The type definitions.
 */
const generateTypeDefinitions = (config) => {
  // Check if config object and tables array exist and are not empty
  if (!config || !config.tables || config.tables.length === 0) {
    // Throw an error if config is invalid or empty
    throw new Error('Invalid or empty configuration provided.');
  }

  // Define allowed operations for comparison operators
  const allowedOps = ['_eq', '_neq', '_lt', '_lte', '_gt', '_gte', '_in', '_nin', '_like'];

  // Generate operators input string using allowed operations
  const operators = generateOperators(allowedOps);

  const typeDefs = [];

  // Generate the root Query and Mutations for each entity in the database
  typeDefs.push(`
  scalar JSON
  scalar GraphQLDate
  scalar MySQLDate
  scalar Upload
  ${operators}

  # Define the root Query
type Query {
  tables: [TableInfo]
${config.tables
  .map((table) => {
    const tableName = table.name;
    const capitalizedTableName = capitalize(table.name);
    return `${tableName}(input: ${capitalizedTableName}QueryOptions = {}): [${capitalizedTableName}]`;
  })
  .join('\n')}
${config.tables
  .map((table) => {
    const tableName = table.name;
    const capitalizedTableName = capitalize(table.name);
    return `${tableName}Count(input: ${capitalizedTableName}Count): ${capitalizedTableName}CountResult`;
  })
  .join('\n')}
    }

  # Define the root Mutation 
type Mutation {
  authorize(input: AuthorizeUser!): AuthPayload!
${config.tables
  .map((table) => {
    const tableName = table.name;
    const capitalizedTableName = capitalize(table.name);
    const resolvers = `${capitalizedTableName}MutationOptions`;
    return `${tableName}(input: ${resolvers}): ${capitalizedTableName}Output`;
  })
  .join('\n')}
}`);

  // Dynamically generate the necessary typedef's for the root types
  config.tables.forEach((table) => {
    const tableName = capitalize(table.name);

    //Define the entities type
    const entitiesFields = `
type ${tableName} {
${table.columns
  .filter((column) => column.name !== 'password')
  .map((column) => {
    let type;
    if (!column.isObject) {
      type = mapColumnTypeToGraphQLType(column.type);
      return `${column.name}: ${column.nullable ? type : new GraphQLNonNull(type)}`;
    } else if (column.isObject && column.type !== 'object') {
      type = mapColumnTypeToGraphQLType(column.type);
      return `${column.name}: ${column.nullable ? type : new GraphQLNonNull(type)}`;
    }
  })
  .filter((value) => value)
  .join('\n')}
${table.columns
  .filter((column) => column.name !== 'password')
  .map((column) => {
    if (column.isObject) {
      const columnForeignEntityCapitalize = capitalize(column.foreignEntity);
      return `${column.foreignEntity}(take: Int = 15, skip: Int): ${
        column.relationType[2] === 'n' ? `[${columnForeignEntityCapitalize}]` : columnForeignEntityCapitalize
      }`;
    }
  })
  .filter((value) => value)
  .join('\n')}
}`;

    //Input logic necessary to handle filtering operations including nested filters
    const filterOperations = `
  # Filters for ${tableName} logical operations
input ${tableName}Filter {
  _and: [ ${tableName}LogicalOp]
  _or: [ ${tableName}LogicalOp]
}

  # Nested Filters for ${tableName} logical and comparison operations
input ${tableName}LogicalOp {
  _and: [ ${tableName}LogicalOp]
  _or: [ ${tableName}LogicalOp]
${table.columns
  .filter((column) => column.type !== 'object')
  .map((column) => {
    return `${column.name}: ComparisonOperators`;
  })
  .join('\n')}
}`;

    //QUERY
    //type defs for query operations
    const queryOptions = `
  # Allowed query operations for ${tableName}
input ${tableName}QueryOptions {
  filter: ${tableName}Filter
  skip: Int
  take: Int = 15
  sort: ${tableName}SortOptions
}`;

    //type defs for sort operations
    const sortOptions = `
  # Define 'sort by' options ( ASC or DESC )
input ${tableName}SortOptions {
${table.columns
  .filter((column) => column.type !== 'object')
  .map((column) => {
    return `${column.name}: Sort`;
  })
  .join('\n')}
}`;

    // MUTATIONS
    //Define the mutations output type
    const mutationsOutput = `
  # Define the mutations output type for ${tableName}
type ${tableName}Output {
	created: [${tableName}]!
	updated: [${tableName}]!
	deleted: Int
  uploaded: String
}`;

    //Define the input options for the mutation operations
    const mutationFilterOptions = `
  # Define the input options for the mutation operations on ${tableName}
input ${tableName}MutationOptions {
  _create: ${tableName}Create
  _update: ${tableName}Update
  _delete: ${tableName}Delete
  _upload: ${tableName}Upload
}`;

    //Input logic for mutation operations
    const mutationInput = `
  # Input logic for create operations on ${tableName}
input ${tableName}Create {
${table.columns
  .filter((column) => column.primaryKey !== true)
  .map((column) => {
    if (column.type === 'object') {
      return '';
    }
    const type = mapColumnTypeToGraphQLType(column.type);
    return `${column.name}: ${column.nullable ? type : new GraphQLNonNull(type)}`;
  })
  .join('\n')}
}

  # Input logic for update operations on ${tableName}
input ${tableName}Update {
  filter: ${tableName}Filter
${table.columns
  .filter((column) => column.primaryKey !== true)
  .map((column) => {
    if (column.type === 'object') {
      return '';
    }
    const type = mapColumnTypeToGraphQLType(column.type);
    return `${column.name}: ${type}`;
  })
  .join('\n')}
}

  # Input logic for delete operations on ${tableName}
input ${tableName}Delete {
  filter: ${tableName}Filter
}

  # Input logic for upload operations on ${tableName}
# NOTE: This is not a standard CRUD operation, but is included for file uploads to work properly.
input ${tableName}Upload {
  filter: ${tableName}Filter
  file: Upload
}`;

    const countInput = `
  # Input logic for count operations on ${tableName}
input ${tableName}Count {
  filter: ${tableName}Filter
  _count: Int
} \n
    # Output the count operations on ${tableName}
type ${tableName}CountResult {
  count: Int!
}`;

    typeDefs.push(
      entitiesFields,
      filterOperations,
      queryOptions,
      sortOptions,
      mutationsOutput,
      mutationFilterOptions,
      mutationInput,
      countInput,
    );
  });

  // Statically generate typedef's for enums and actions like Auth and providing table info
  typeDefs.push(`

enum Sort {
  ASC
  DESC
}

  ## Necessary type defs for Auth resolvers
input AuthorizeUser {
  email: String!
  password: String!
}

input RoleInput {
  role: String!
}

type AuthPayload {
  token: Token!
}

type Token {
  accessToken: String!
  idToken: String!
  refreshToken: String!
}

  ## Necessary type defs for providing the backOffice with table structure
type TableInfo {
  table: String
  structure: String
  backoffice: String
}`);
  return typeDefs.join('\n');
};

/**
 ** Generates the operators input string using allowed operations
 * @param {Array<string>} allowedOps - An array of allowed operations
 * @returns {string} The operators input string
 */
function generateOperators(operators) {
  const operatorsStr = operators.map((operator) => {
    return `${operator}: String`;
  });

  return `
  # Define allowed operations for comparison operators
input ComparisonOperators {
${operatorsStr.join('\n')}
}
`;
}

// Retrieve the entities configuration data from the configuration files
const config = await readConfigFile();

if (config) {
  //Generate the typeDefs based on the entities configuration data
  const typeDefsString = generateTypeDefinitions(config);
  /**
   * Writes the type definitions to a file.
   * @param {string} filePath - The path to the file.
   * @param {string} typeDefsString - The type definitions.
   */
  fs.writeFileSync('../src/graphql/typeDefs.graphql', typeDefsString);

  console.log('Type definitions generated successfully.');
} else {
  logger.error('Unable to generate type definitions. Check the configuration file.');
}

export { readConfigFile };
