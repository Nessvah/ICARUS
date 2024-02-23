import {
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLEnumType,
} from 'graphql';
import { ACTIONTYPES } from '../utils/enums/enums.js';
import { capitalize, mapColumnTypeToGraphQLType } from '../presentation/generateTypeDefs.js';
import fs from 'fs';
import { gql } from 'graphql-tag';

const readConfigFile = () => {
  try {
    return JSON.parse(fs.readFileSync('../src/config.json', 'utf8'));
  } catch (error) {
    console.error('Error reading config file:', error);
    return null;
  }
};

const configFile = readConfigFile();

//! OPTION 1 - GRAPHQL CONSTRUCTORS
//(graphqlobjecttype, graphqlinputobjecttype...)
//TODO: Generate types for each entity (table name)
function generateTypes(configFile) {
  /* ex: type Customers {
            customer_id: Int!
            customer_name: String
            email: String
            icon_class: String
            icon_label: String
          }
*/

  const { tables } = configFile;

  // create empty object for the entities
  const entityTypes = {};

  // start dynamically building the entities type
  for (const table of tables) {
    // generate their fields for each entity
    const fields = generateEntityFields(table.columns);

    // get the entity name for the type
    entityTypes[`${capitalize(table.name)}`] = new GraphQLObjectType({
      name: table.name,
      description: 'something description if we want to appear in docs',
      fields,
    });
  }

  console.log(entityTypes);
}

/*
    id : ID!
    name: String!
    location: String
    */

//? what we need to take in consideration
// primary keys? -> ID
// nullable ? -> Nullable

function generateEntityFields(columns) {
  const entityFields = {};

  for (const column of columns) {
    // get name, type, primary key, nullable
    const { name, type, primaryKey, nullable } = column;

    // if its a primary key it's a graphql id, otherwise if it's nullable we get just
    // their graphql type, otherwise we get the type but specify that it's mandatory
    const graphqlType = primaryKey
      ? GraphQLID
      : nullable
        ? mapColumnTypeToGraphQLType(type)
        : new GraphQLNonNull(mapColumnTypeToGraphQLType(type));

    entityFields[name] = {
      type: graphqlType,
    };
  }

  return entityFields;
}

generateTypes(configFile);

// //TODO: Generate Enum Types for actions ?? (does query really needs one?)

// //TODO: Generate filters
// ex: {filter: {name: {_eq: 50}}} or {filter: {_and: {age: {_lte: 15}} {name: {_eq: "joana"}}}}

// //TODO: Generate the overall query

//! OPTION 2 - USING GPL - STRING BASED

function generateEntityTypesGPL(configFile) {
  const { tables } = configFile;

  const typeDefinitions = tables.map((table) => {
    const typeName = capitalize(table.name);
    const fields = generateEntityFieldsGPL(table.columns);

    // Construct the type definition string
    const typeDefinitionString = `
      type ${typeName} {
        """something"""
        ${fields}
      }
    `;

    return gql(typeDefinitionString);
  });

  return typeDefinitions;
}

function generateEntityFieldsGPL(columns) {
  const entityFields = columns.map((column) => {
    const { name, type, primaryKey, nullable } = column;
    const graphqlType = primaryKey
      ? 'ID!'
      : nullable
        ? mapColumnTypeToGraphQLType(type)
        : `${mapColumnTypeToGraphQLType(type)}!`;

    return `${name}: ${graphqlType}`;
  });

  return entityFields.join('\n');
}

const entityTypes = generateEntityTypesGPL(configFile);

// Log the generated GraphQL type definitions
entityTypes.forEach((type) => {
  console.log(type);
});
