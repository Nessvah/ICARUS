import fs from 'fs';

const beforeResolver = async (table, args, context) => {
  try {
    const filePath = `config/entities/${table}.js`;

    // Verifying if the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Importing entity informations
    const entityInfo = await import(`../../${filePath}`);

    // Verifying if there is a hook called beforeResolverHook
    const beforeResolverHook = entityInfo[`${table}BeforeResolverHook`];
    if (typeof beforeResolverHook !== 'function') {
      return;
    }

    // Executing the hook with arguments
    const result = await beforeResolverHook(args);

    // Veifying if the user is allowed to make the query
    if (!result) {
      throw new Error('User not allowed');
    }
  } catch (error) {
    throw new Error(error);
  }
};

export { beforeResolver };
