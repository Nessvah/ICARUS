import fs from 'fs';
//import { logger } from '../infrastructure/server.js';
import {
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
} from 'graphql';
import { GraphQLJSON } from 'graphql-scalars';

import { ImportThemTities } from '../config/importDemTities.js';
/**
 * Reads a JSON file and returns the parsed data.
 * @param {string} filePath - The path to the file.
 * @returns {object} The parsed JSON data or null if an error occurs.
 */

// Call the importAll method to start importing entities
const importer = new ImportThemTities();

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
  switch (columnType) {
    case 'INT':
      return GraphQLInt;
    case 'VARCHAR':
      return GraphQLString;
    case 'DECIMAL':
      return GraphQLFloat;
    case 'TIMESTAMP':
      return GraphQLString;
    case 'BOOLEAN':
      return GraphQLBoolean;
    case 'string':
      return GraphQLString;
    case 'number':
      return GraphQLInt;
    case 'float':
      return GraphQLFloat;
    case 'int':
      return GraphQLInt;
    case 'id':
      return GraphQLID;
    case 'object':
      return GraphQLString;
    case 'array':
      return GraphQLString;
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
  //console.log(config);
  const typeDefs = [];

  // Define the Query type
  typeDefs.push(`
type Query {
  tables: [TableInfo]
    ${config.tables
      .map((table) => {
        const tableName = table.name;
        const capitalizedTableName = capitalize(table.name);
        return `${tableName}(input: Resolvers${capitalizedTableName}): [${capitalizedTableName}]`;
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
        const resolvers = `Resolvers${capitalizedTableName}`;
        return `${tableName}(input: ${resolvers}): ${capitalizedTableName}Output`;
      })
      .join('\n')}
}`);

  config.tables.forEach((table) => {
    const tableName = capitalize(table.name);
    //Define the Resolvers input
    const resolvers = `
input Resolvers${tableName} {
    filter: ${tableName}Filter
	action: ActionType!
    create: [${tableName}Input]
	update: ${tableName}Update
    take: Int = 15
    skip: Int
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
            let columnForeignEntityCapitalize = capitalize(column.foreignEntity);
            return `${column.foreignEntity}: ${
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
    ${table.columns
      .filter((column) => column.name !== 'password')
      .map((column) => {
        if (column.type === 'object') {
          return '';
        }
        const type = mapColumnTypeToGraphQLType(column.type);
        return `${column.name}: [${type}]`;
      })
      .join('\n')}
}`;

    //Define the Update entities input
    const update = `
input ${tableName}Update {
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
}`;
    // Define the output type
    const output = `
type ${tableName}Output {
	created: [${tableName}]!
	updated: [${tableName}]!
	deleted: Int
}`;

    const ordersCountInput = `
  input ${tableName}Count {
    action: ActionType!
  } \n

  type ${tableName}CountResult {
    action: String
    count: Int!
  }
`;

    typeDefs.push(resolvers, tableTypeDef, tableInputTypeDef, tableFilters, update, output, ordersCountInput);
  });

  // Redefinition of the input type for authorizing a user, possibly a duplication error.
  typeDefs.push(`
input AuthorizeUser {
  email: String!
  password: String!
}

enum ActionType {
  COUNT
  FIND
  CREATE
  UPDATE
  DELETE
}
`);

  // Redefinition of the input type for specifying a role, possibly a duplication error.
  typeDefs.push(`
input RoleInput {
  role: String!
}`);

  // Define a type for the authentication payload, which includes a token.
  typeDefs.push(`
type AuthPayload {
  token: Token!
}`);

  // Define a type for a token, which includes access, identity, and refresh tokens.
  typeDefs.push(`
type Token {
  accessToken: String!
  idToken: String!
  refreshToken: String!
}`);

  // Define a type for providing information about a database table, including its name and structure.
  typeDefs.push(`
  type TableInfo {
    table: String
    structure: String
    backoffice: String
  }`);
  return typeDefs.join('\n');
};

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
  fs.writeFileSync('../src/presentation/typeDefs.graphql', typeDefsString);

  console.log('Type definitions generated successfully.');
} else {
  console.error('Unable to generate type definitions. Check the configuration file.');
}

export { readConfigFile };
