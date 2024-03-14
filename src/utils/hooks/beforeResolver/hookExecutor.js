/**
 * Constructor for MongoDBConnection class.
 * @param {string} table - Name of current table.
 * @param {object} args - Args with input information.
 * @param {string} QueryType - Query type (Mutation/Query).
 * @returns {Promise<object[]>} - Modified args or same args.
 */
const hookExecutor = async (table, properties, operation, hook) => {
  const queryInformation = { ...properties };
  console.log(queryInformation);
  try {
    let callFunction;
    if (table.hooks && table.hooks.all && table.hooks.all[hook]) {
      callFunction = table.hooks.all[hook];
    } else if (table.hooks && table.hooks[operation] && table.hooks[operation][hook]) {
      callFunction = table.hooks[operation][hook];
    } else {
      callFunction = undefined; // Ou outro valor padrão, se desejado
    }
    if (!callFunction) {
      return queryInformation;
    }
    return (await callFunction(queryInformation)) || queryInformation;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Constructor for MongoDBConnection class.
 * @param {string} table - Name of current table.
 * @param {object} args - Args with input information.
 * @param {object} column - Actual column on iteration.
 * @returns {Promise<object[]>} - Modified args or same args.
 */
const beforeResolverRelations = async (table, args, column, parent) => {
  let tempArgs = args;
  // for mongodb searching parents
  if (table.database.type === 'mongodb') {
    //const idValue = ObjectId.isValid(parent[column.name]) ? parent[column.name].toString() : parent[column.name];
    args = { input: { filter: { _and: { [column.foreignKey]: { _eq: parent.id } } } } };
    // for MySQL searching parents
  } else {
    args = { input: { filter: { [column.foreignKey]: parent[column.foreignKey] } } };
  }

  // Verification of take and skip inside input
  tempArgs.take ? (args.input.take = tempArgs.take) : '';
  tempArgs.skip ? (args.input.skip = tempArgs.skip) : '';

  return args;
};

export { hookExecutor, beforeResolverRelations };
