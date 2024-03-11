const beforeResolverMutation = async function (table, entityInfo, args) {
  try {
    const operation = Object.keys(args.input)[0];

    // Verifying if there is a hook called permissionHook
    const operationHook = entityInfo[`${table}${operation}`];
    if (typeof operationHook !== 'function') {
      return;
    }

    const res = await operationHook(args);
    return res;
  } catch (e) {
    throw new Error(e);
  }
};

export { beforeResolverMutation };
