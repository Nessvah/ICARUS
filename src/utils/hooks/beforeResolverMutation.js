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
    return res;
  } catch (e) {
    throw new Error(e);
  }
};

export { beforeResolverMutation };
