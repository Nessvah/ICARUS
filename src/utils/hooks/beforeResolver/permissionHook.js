/**
 * Constructor for MongoDBConnection class.
 * @param {object} entityInfo - Information about the entity file .js.
 * @param {string} table - The name of the entity which is comming.
 * @param {object} args - Args with input information.
 * @param {string} QueryType - Query type (Mutation/Query).
 * @returns {boolean} returns true or false depending on permission.
 */

const permissionHook = async function (entityInfo, table, args, QueryType) {
  try {
    // Verifying if there is a hook called permissionHook
    const permissionHook = entityInfo[`${table}Permission${QueryType}`];
    if (typeof permissionHook !== 'function') {
      return;
    }

    // Executing the hook with arguments
    const result = await permissionHook(args);

    // Verifying if the user is allowed to make the query
    if (!result) {
      throw new Error('User not allowed to make the query');
    }
    return true;
  } catch (e) {
    throw new Error('Error in permission function: ' + e.message);
  }
};

export { permissionHook };
