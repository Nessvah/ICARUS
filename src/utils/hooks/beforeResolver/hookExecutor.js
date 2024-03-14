/**
 * Constructor for MongoDBConnection class.
 * @param {string} table - Name of current table.
 * @param {object} args - Args with input information.
 * @param {string} QueryType - Query type (Mutation/Query).
 * @returns {Promise<object[]>} - Modified args or same args.
 */
const hookExecutor = async (table, operation, hook, properties) => {
  const queryInformation = { ...properties };
  try {
    let callFunction;

    if (table.hooks && table.hooks.all && table.hooks.all[hook]) {
      // Attempt to access the function from the 'all' property of 'table.hooks'
      callFunction = table.hooks.all[hook];
    } else if (table.hooks && table.hooks[operation] && table.hooks[operation][hook]) {
      // If not found, attempt to access the function from the specific 'operation' property
      callFunction = table.hooks[operation][hook];
    } else {
      // If neither 'all' nor 'operation' properties contain the function, set func to undefined
      callFunction = undefined;
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
