import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../infrastructure/server.js';

import { GraphQLString, GraphQLInt, GraphQLFloat, GraphQLNonNull, GraphQLBoolean, GraphQLID } from 'graphql';
import { MySQLDate, GraphQLDate } from './customScalars.js';
import { GraphQLJSON } from 'graphql-type-json';

import { ImportThemTities } from '../config/importDemTities.js';
// Call the importAll method to start importing entities
const importer = new ImportThemTities();

/**
 * The directory name of the current module file.
 * @type {string}
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// config will receive the entities and db configurations, generated by the readConfigFile function, and export them to other files.
let config;

/**
 ** Reads the config files and returns the parsed data.
 * @param {string} filePath - The path to the file.
 * @returns {object} The parsed JSON data or null if an error occurs.
 */
const readConfigFile = async (configPath) => {
  try {
    // Retrieve the entities configuration data from the configuration files
    config = await importer.importAll(configPath);

    if (config && config.tables) {
      //Generate the typeDefs based on the entities configuration data
      const typeDefsString = generateTypeDefinitions(config);
      /**
       ** Writes the type definitions to a file.
       * @param {string} filePath - The path to the file.
       * @param {string} typeDefsString - The type definitions.
       */
      fs.writeFileSync(path.join(__dirname, './typeDefs.graphql'), typeDefsString);
      console.log('Type definitions generated successfully.');
    } else {
      logger.error('Unable to generate type definitions. Check the configuration file.');
    }
  } catch (error) {
    logger.error('Error reading config file:', error);
  }
};

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
${config.tables
  .map((table) => {
    const tableName = table.name;
    const capitalizedTableName = capitalize(table.name);
    const resolvers = `${capitalizedTableName}MutationOptions`;
    return `${tableName}(input: ${resolvers}): ${capitalizedTableName}Output`;
  })
  .join('\n')}
}

# list Entities
enum Folders {
${config.tables
  .map((table) => `${table.name.toUpperCase()}`) // Convert table names to uppercase for enum values
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
}

input ${tableName}UploadFilter {
${table.columns
  .filter((column) => column.extra === 'key')
  .map((column) => {
    return `${column.name}: String`;
  })
  .join('\n')}
}`;

    //QUERY
    //type defs for query operations
    const queryOptions = `
    # Allowed query operations for ${tableName}
input ${tableName}QueryOptions {
  filter: ${table.database.type === 's3' ? `${tableName}UploadFilter` : `${tableName}Filter`}
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
    if (column.type === 'object' || column.extra === 'DEFAULT_GENERATED') {
      return '';
    }
    /*     if (column.extra === 'folder') {
      return `${column.name}: Entities`;
    } */
    const type = mapColumnTypeToGraphQLType(column.type);
    return `${column.name}: ${column.nullable ? type : new GraphQLNonNull(type)}`;
  })
  .join('\n')}
}

  # Input logic for update operations on ${tableName}
input ${tableName}Update {
  filter:  ${table.database.type === 's3' ? `${tableName}UploadFilter` : `${tableName}Filter`}
${
  table.database.type === 's3'
    ? `${table.columns
        .filter((column) => column.extra === 'key')
        .map((column) => {
          return `${column.name}: String`;
        })
        .join('\n')}`
    : `${table.columns
        .filter((column) => column.primaryKey !== true)
        .map((column) => {
          if (column.type === 'object' || column.extra === 'DEFAULT_GENERATED') {
            return '';
          }
          const type = mapColumnTypeToGraphQLType(column.type);
          return `${column.name}: ${type}`;
        })
        .join('\n')}`
}
}

  # Input logic for delete operations on ${tableName}
input ${tableName}Delete {
  filter:  ${table.database.type === 's3' ? `${tableName}UploadFilter` : `${tableName}Filter`}
}

  # Input logic for upload operations on ${tableName}
# NOTE: This is not a standard CRUD operation, but is included for file uploads to work properly.
input ${tableName}Upload {
  file: Upload
  filter: ${table.database.type === 's3' ? `${tableName}UploadFilter` : `${tableName}Filter`}
  ${table.database.type === 's3' ? `folder: Folders` : `location: UploadLocation`}
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

  // Statically generate typedef's for enums and providing table info
  typeDefs.push(`
enum UploadLocation{
  FS
  S3
}

enum Sort {
  ASC
  DESC
}

  ## Necessary type defs for providing the backOffice with table structure
type TableInfo {
  table: String
  structure: String
  backoffice: String
}`);
  return typeDefs.join('\n');
};

function generateOperators(operators) {
  const operatorsStr = operators.map((operator) => {
    return `${operator}: String`;
  });

  return `
    input ComparisonOperators {
      ${operatorsStr.join('\n')}
    }
  `;
}

export { readConfigFile, config };
