import {
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
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
      name: `${table.name}Type`,
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

//TODO: Generate operators
const OperatorsInputType = new GraphQLInputObjectType({
  name: 'OperatorsInput',
  fields: () => ({
    _eq: { type: GraphQLString },
    _neq: { type: GraphQLString },
    _lt: { type: GraphQLString },
    _lte: { type: GraphQLString },
    _gt: { type: GraphQLString },
    _gte: { type: GraphQLString },
    _like: { type: GraphQLString },
    _and: { type: new GraphQLList(OperatorsInputType) },
    _or: { type: new GraphQLList(OperatorsInputType) },
    _not: { type: OperatorsInputType },
  }),
});

// //TODO: Generate filters
// ex: {filter: {name: {_eq: 50}}} or {filter: {_and: {age: {_lte: 15}} {name: {_eq: "joana"}}}}

const FilterInputType = new GraphQLInputObjectType({
  name: 'FilterInput',
  fields: () => ({
    _and: { type: new GraphQLList(OperatorsInputType) },
    _or: { type: new GraphQLList(OperatorsInputType) },
  }),
});

// TODO: Generate skip/take as input types

function generatePaginationInput() {
  return {
    skip: { type: GraphQLInt },
    take: { type: GraphQLInt },
  };
}
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

  // filter
  // skip
  // take

  // Initialize the fields object

  const pagination = generatePaginationInput();

  const fields = {};
  // Create fields for each entity dynamically
  Object.keys(entities).forEach((entityName) => {
    fields[entityName] = {
      type: new GraphQLList(entities[entityName]),
      args: {
        skip: { type: GraphQLInt },
        take: { type: GraphQLInt },
        filter: { type: FilterInputType },
      },
      resolve: (_parent, args, ctx) => {
        // Implement data fetching logic using args.skip and args.take
        console.log(_parent, args, ctx);
        return [entityName];
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
