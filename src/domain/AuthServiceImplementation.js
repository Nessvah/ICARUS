import AuthService from './AuthService.js';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/error-handling/CustomErrors.js';
/**
 * This class is the concrete implementation of the AuthService interface.
 */

class AuthServiceImplementation extends AuthService {
  constructor(authRepository, secreKey) {
    super();
    this.authRepository = authRepository;
    this.secretKey = secreKey;
  }

  // method to check if the user is authenticated
  authenticateUser(email, password) {
    // check if the email exists in the db
    const user = this.authRepository.getUserByUniqueKey(email);

    // if the user exists and the passwords match we can assign a token
    if (user && user.password === password) {
      const token = jwt.sign({ email: user.email }, this.secretKey);
      return token;
    }

    // authentication failed
    throw new AuthenticationError('Credenciais inválidas.');
  }

  // method to verify the token that the client sends
  verifyToken(token) {
    try {
      const { email } = jwt.verify(token, this.secretKey);
      return email;
    } catch (e) {
      throw new AuthenticationError('Token inválido');
    }
  }
}

export { AuthServiceImplementation };
