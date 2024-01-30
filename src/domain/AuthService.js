//TODO: check we vitor for the correct place for interfaces/abstract classes

/**
 * It's a class declaration defining the methods and their signatures without
 * providing the implementation details.
 * Typically, it doesn't contain the actual logic for authentication but
 * rather outlines what methods should be available for authentication
 */

/* eslint-disable no-unused-vars */

/**
 * @interface AuthService
 * @description Interface for authentication service
 */
class AuthService {
  /**
   * Authenticate user.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {string} JWT token if authentication successful, null otherwise.
   */

  authenticateUser(email, password) {}

  /**
   * Verify JWT token.
   * @param {string} token - JWT token.
   * @returns {string|null} User's email if token is valid, null otherwise.
   */
  verifyToken(token) {}

  /**
   * Check the permissions for the user.
   * @param {string} user - user info.
   * @param {array} permissions - array of user permissions
   * @returns {boolean} Returns true if user has permissions false otherwise.
   */
  authorizeUser(user, permissions) {}
}

export default AuthService;
