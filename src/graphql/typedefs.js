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
  execute,
} from 'graphql';

import { capitalize, mapColumnTypeToGraphQLType, readConfigFile } from '../presentation/generateTypeDefs.js';

let configFile;
try {
  configFile = readConfigFile();
} catch (error) {
  console.error(error.message);
}

/**
 * Generates GraphQL types dynamically based on the configuration file.
 * @param {Object} configFile - Configuration object.
 * @returns {Object} Object containing all entities as Graphql Types
 *
 * @example type Customers {
              customer_id: Int!
              customer_name: String
              email: String
              icon_class: String
              icon_label: String
            }
 */
function generateTypes(configFile) {
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

  return entityTypes;
}

/**
 * Generates GraphQL fields for an entity based on its columns.
 * @param {Array} columns - Array of column objects for an entity.
 * @returns {Object} Object containing GraphQL fields for the entity.
 */
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

// //TODO: Generate filters
// ex: {filter: {name: {_eq: 50}}} or {filter: {_and: {age: {_lte: 15}} {name: {_eq: "joana"}}}}

// //TODO: Generate the overall query

/**
 * Generates GraphQL query dynamically based on the configured entities.
 * @param {Object} configFile - Configuration object.
 * @returns {Object} GraphQLObjectType for the generated query.
 */
function generateQuery(configFile) {
  const entities = generateTypes(configFile);
  /*
    type Query {
    Categories: [Categories]!
  }
 */
  // Initialize the fields object
  const fields = {};

  // Append each entity to the fields object
  Object.keys(entities).forEach((entityName) => {
    fields[entityName] = {
      type: new GraphQLList(entities[entityName]),
      resolve: () => {
        // for now return just an empty array
        return ['yee'];
      },
    };
  });

  return new GraphQLObjectType({
    name: 'Query',
    fields,
  });
}

const query = generateQuery(configFile);

export const schema = new GraphQLSchema({
  query,
});
