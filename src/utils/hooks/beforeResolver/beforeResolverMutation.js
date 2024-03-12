import { validation } from '../../validation/validation.js';

/**
 * Constructor for MongoDBConnection class.
 * @param {object} entityInfo - Information about the entity file .js.
 * @param {string} table - The name of the entity which is comming.
 * @param {object} args - Args with input information.
 * @returns {Promise<object[]>} - Modified args or same args.
 */
const beforeResolverMutation = async function (table, entityInfo, args) {
  try {
    // Taking the operation name "_create, _update, _delete"
    const operation = Object.keys(args.input)[0];

    // Verifying if there is a hook called operationHook
    const operationHook = entityInfo[`${table}${operation}`];
    if (typeof operationHook !== 'function') {
      return;
    }

    // Making any changing if there is hook for this entity for this operation
    const res = await operationHook(args);
    await validation(args.input); // it validates mutation inputs
    await validation(args.input, '_update'); // it validates update inputs;

    return res;
  } catch (e) {
    throw new Error(e);
  }
};

export { beforeResolverMutation };
