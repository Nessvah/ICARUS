import fs from 'fs';
//import { logger } from '../infrastructure/server.js';
import { GraphQLString, GraphQLInt, GraphQLFloat, GraphQLNonNull, GraphQLBoolean, GraphQLID } from 'graphql';

/**
 * Reads a JSON file and returns the parsed data.
 * @param {string} filePath - The path to the file.
 * @returns {object} The parsed JSON data or null if an error occurs.
 */
const readConfigFile = () => {
  try {
    return JSON.parse(fs.readFileSync('../src/config.json', 'utf8'));
  } catch (error) {
    console.error('Error reading config file:', error);
    return null;
  }
};
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
    case 'timestamp': // create scalar type for timestamps
      return GraphQLString;
    case 'decimal':
    case 'float':
      return GraphQLFloat;
    case 'boolean':
      return GraphQLBoolean;
    case 'id':
      return GraphQLID;
    default:
      throw new Error(`Unsupported column type: ${columnType}`);
  }
};

const typeDefs = [];
/**
 * Generates the type definitions for the GraphQL schema.
 * @param {object} config - The configuration data.
 * @returns {string} The type definitions.
 */
const generateTypeDefinitions = (config) => {
  if (!config || !config.tables || config.tables.length === 0) {
    throw new Error('Invalid or empty configuration provided.');
  }

  // Define the Query type
  typeDefs.push(`
# define the root Query
type Query {
  tables: [TableInfo]
    ${config.tables
      .map((table) => {
        const tableName = table.name;
        const capitalizedTableName = capitalize(table.name);
        return `${tableName}(input: ${capitalizedTableName}ListOptions): [${capitalizedTableName}]`;
      })
      .join('\n')}
}

# define the root Muation
type Mutation {
  authorize(input: AuthorizeUser!): AuthPayload!
    ${config.tables
      .map((table) => {
        const tableName = table.name;
        const capitalizedTableName = capitalize(table.name);
        const resolvers = `${capitalizedTableName}ListOptions`;
        return `${tableName}(input: ${resolvers}): ${capitalizedTableName}Output`;
      })
      .join('\n')}
}`);

  // start creating all the schemas
  config.tables.forEach((table) => {
    const tableName = capitalize(table.name);
    //Define the Resolvers input
    const queryOptions = `
input ${tableName}ListOptions {
    filter: ${tableName}Filter
    skip: Int
    take: Int
}`;
    //Define the entities type
    const tableTypeDef = `
type ${tableName} {
    ${table.columns
      .filter((column) => column.name !== 'password')
      .map((column) => {
        const type = mapColumnTypeToGraphQLType(column.type);
        return `${column.name}: ${column.nullable ? type : new GraphQLNonNull(type)}`;
      })
      .join('\n')}
}`;
    //Define the entities input
    const tableInputTypeDef = `
input ${tableName}Input {
    ${table.columns
      .filter((column) => column.primaryKey !== true)
      .map((column) => {
        const type = mapColumnTypeToGraphQLType(column.type);
        return `${column.name}: ${column.nullable ? type : new GraphQLNonNull(type)}`;
      })
      .join('\n')}
}`;

    //Define the Filter entities input
    const tableFilters = `
input ${tableName}Filter {
  _and: [NestedFiltering]
  _or:NestedFiltering
    ${table.columns
      .map((column) => {
        const type = mapColumnTypeToGraphQLType(column.type);
        return `${column.name}: ComparisonOperators`;
      })
      .join('\n')}

}`;

    const nestedFiltering = `
  input NestedFiltering {
    _and: [NestedFiltering]
    _or: [NestedFiltering]
     ${table.columns
       .map((column) => {
         const type = mapColumnTypeToGraphQLType(column.type);
         return `${column.name}: ComparisonOperators`;
       })
       .join('\n')}
  }
`;

    typeDefs.push(nestedFiltering);

    //Define the Update entities input
    const update = `
input ${tableName}Update {
    ${table.columns
      .filter((column) => column.primaryKey !== true)
      .map((column) => {
        const type = mapColumnTypeToGraphQLType(column.type);
        return `${column.name}: ${type}`;
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

    typeDefs.push(queryOptions);
    typeDefs.push(tableTypeDef);
    typeDefs.push(tableInputTypeDef);
    typeDefs.push(tableFilters);
    typeDefs.push(update);
    typeDefs.push(output);
  });

  // Define the operators enum
  typeDefs.push(`
enum ActionType {
  CREATE
  UPDATE
  DELETE
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

const allowedOps = ['_eq', '_neq', '_lt', '_lte', '_gt', '_gte', '_in', '_nin'];

const operators = generateOperators(allowedOps);
typeDefs.push(operators);
/**
 * The path to the configuration file.
 */
const config = readConfigFile();

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
  fs.writeFileSync('../src/presentation/typeDefs.graphql', typeDefsString);

  console.log('Type definitions generated successfully.');
} else {
  console.error('Unable to generate type definitions. Check the configuration file.');
}

export { readConfigFile };
