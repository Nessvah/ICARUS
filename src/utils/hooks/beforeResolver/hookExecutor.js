/**
 * Constructor for MongoDBConnection class.
 * @param {string} table - Information of current table.
 * @param {string} operation - query, _update, _delete, _create.
 * @param {string} hook - Hook name (beforeQuery, beforeResolver..).
 * @param {object} properties - Args + context information.
 * @returns {Promise<object[]>} - Modified args or same args.
 */
const hookExecutor = async (table, operation, hook, properties) => {
  const queryInformation = { ...properties };
  try {
    // To call the function inside the entity
    let callFunction;

    if (table.hooks && table.hooks.all && table.hooks.all[hook]) {
      // Accessing the parameter 'all' of 'table.hooks'
      callFunction = table.hooks.all[hook];
    } else if (table.hooks && table.hooks[operation] && table.hooks[operation][hook]) {
      // If there is not, accessing the 'operation' property
      callFunction = table.hooks[operation][hook];
    } else {
      // If there arent all or operation function, set callFunction to undefined
      callFunction = undefined;
    }
    // If there is not callFunction, return the properties as it came
    if (!callFunction) {
      return queryInformation;
    }
    // If there is, call the function
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
