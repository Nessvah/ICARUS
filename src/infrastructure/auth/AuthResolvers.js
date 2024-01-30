import { AuthenticationError } from '../../shared/utils/error-handling/CustomErrors.js';

/**
 * middleware function / wrapper resolver that checks if the
 * current user is authenticated based on the context.
 * @param {*} resolver
 * @returns original resolver if authenticated
 */

const isAutenticated = (resolver) => async (_, args, ctx) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError('Sem autorização para aceder. Por favor faça login.');
  }

  // we need to call the original resolver if the
  // authentication is successful
  return resolver(_, args, ctx);
};

export { isAutenticated };
