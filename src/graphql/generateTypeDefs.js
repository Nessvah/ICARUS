import fs from 'fs';
//import { logger } from '../infrastructure/server.js';
import { GraphQLString, GraphQLInt, GraphQLFloat, GraphQLNonNull, GraphQLBoolean, GraphQLID } from 'graphql';

import { MySQLDate, GraphQLDate } from './customScalars.js';

import { GraphQLJSON } from 'graphql-type-json';

import { ImportThemTities } from '../config/importDemTities.js';
/**
 * Reads a JSON file and returns the parsed data.
 * @param {string} filePath - The path to the file.
 * @returns {object} The parsed JSON data or null if an error occurs.
 */

// Call the importAll method to start importing entities
const importer = new ImportThemTities();

// Alias definition for GraphQLJSON as JSON
const JSONAliasDefinition = 'scalar JSON';
const ISODateAliasDefinition = 'scalar GraphQLDate';
const MySQLDateAliasDefinition = 'scalar MySQLDate';

const readConfigFile = async () => {
  try {
    const config = await importer.importAll(); // Await the result of importAll()

    if (config && config.tables) {
      // Ensure config.tables is defined
      //console.log('Config:', config, '______________'); // Log the retrieved config
      return config;
    } else {
      console.error('Config data is missing or incomplete.');
      return null;
    }
  } catch (error) {
    console.error('Error reading config file:', error);
    return null;
  }
};

//console.log(await readConfigFile());
/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
/**
 * Maps a database column type to a GraphQL type.
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
 * Generates the type definitions for the GraphQL schema.
 * @param {object} config - The configuration data.
 * @returns {string} The type definitions.
 */

const generateTypeDefinitions = (config) => {
  if (!config || !config.tables || config.tables.length === 0) {
    throw new Error('Invalid or empty configuration provided.');
  }
  const allowedOps = ['_eq', '_neq', '_lt', '_lte', '_gt', '_gte', '_in', '_nin', '_like'];

  const operators = generateOperators(allowedOps);

  //console.log(config);
  const typeDefs = [];

  // Define the Query type
  typeDefs.push(`
  ${JSONAliasDefinition}
  ${ISODateAliasDefinition}
  ${MySQLDateAliasDefinition}
  ${operators}
  
# define the root Query
type Query {
  tables: [TableInfo]
    ${config.tables
      .map((table) => {
        const tableName = table.name;
        const capitalizedTableName = capitalize(table.name);
        return `${tableName}(input: ${capitalizedTableName}ListOptions = {}): [${capitalizedTableName}]`;
      })
      .join('\n')}
    ${config.tables
      .map((table) => {
        const tableName = table.name;
        const capitalizedTableName = capitalize(table.name);
        return `${tableName}Count(input: ${capitalizedTableName}Count): ${capitalizedTableName}CountResult`;
      })
      .join('\n')}
}`);
  // Define the Mutation type
  typeDefs.push(`
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

  // start creating all the schemas
  config.tables.forEach((table) => {
    const tableName = capitalize(table.name);
    //Define the Resolvers input
    const queryFilterOptions = `
input ${tableName}ListOptions {
    filter: ${tableName}Filter
    skip: Int
    take: Int = 15
    sort: ${tableName}SortOptions
    }`;

    //Define the Resolvers input
    const mutationFilterOptions = `
input ${tableName}MutationOptions {
    _create: ${tableName}Input
    _update: ${tableName}UpDel
    _delete: ${tableName}Delete
    }`;

    //Define the entities type
    const tableTypeDef = `
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

    //Define the entities input
    const tableInputTypeDef = `
input ${tableName}Input {
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
}`;

    //Define the Filter entities input
    const tableFilters = `
input ${tableName}Filter {
  _and: [ ${tableName}LogicalOp]
  _or: [ ${tableName}LogicalOp]
}`;

    //  Define the Filter entities input
    const sortOptions = `
    input ${tableName}SortOptions {
      ${table.columns
        .filter((column) => column.type !== 'object')
        .map((column) => {
          return `${column.name}: Sort`;
        })
        .join('\n')}
    }`;

    const logicalOperations = `
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

    const nestedFiltering = `
      input NestedFiltering {
        _and: [NestedFiltering]
        _or: [NestedFiltering]
         ${table.columns
           .filter((column) => column.primaryKey !== true || column.isObject)
           .map((column) => {
             return `${column.name}: ComparisonOperators`;
           })
           .join('\n')}
      }
    `;

    const ordersCountInput = `
  input ${tableName}Count {
    _count: Int
  } \n

  type ${tableName}CountResult {
   action: String
    count: Int!
  }
`;

    typeDefs.push(nestedFiltering, ordersCountInput, sortOptions, logicalOperations, mutationFilterOptions);

    //Define the Update entities input
    const update = `
input ${tableName}UpDel {
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
       filter: ${tableName}Filter
}`;

    const del = `
input ${tableName}Delete {
       filter: ${tableName}Filter
}`;

    //Define the Update entities input
    const sort = `
     input ${tableName}Sort {
         ${table.columns
           .filter((column) => column.primaryKey !== true)
           .map((column) => {
             if (column.foreignKey) {
               return '';
             }
             return `${column.name}: Sort`;
           })
           .join('\n')}
     }`;

    // Define the output type
    const output = `
type ${tableName}Output {
	created: [${tableName}]!
	updated: [${tableName}]!
	deleted: Int
}`;

    typeDefs.push(queryFilterOptions);
    typeDefs.push(tableTypeDef);
    typeDefs.push(tableInputTypeDef);
    typeDefs.push(tableFilters);
    typeDefs.push(update);
    typeDefs.push(output, del, sort);
  });

  // Define the operators enum
  typeDefs.push(`
  enum Sort {
  ASC
  DESC
}

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

  type TableInfo {
    table: String
    structure: String
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

/**
 * The path to the configuration file.
 */
const config = await readConfigFile();

if (config) {
  /**
   * The generated type definitions.
   */
  const typeDefsString = generateTypeDefinitions(config);
  /**
   * Writes the type definitions to a file.
   * @param {string} filePath - The path to the file.
   * @param {string} typeDefsString - The type definitions.
   */
  fs.writeFileSync('../src/graphql/typeDefs.graphql', typeDefsString);

  console.log('Type definitions generated successfully.');
} else {
  console.error('Unable to generate type definitions. Check the configuration file.');
}

export { readConfigFile };
