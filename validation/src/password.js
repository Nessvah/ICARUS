import bcrypt from 'bcrypt';

/**
 * Checks if the password contains any sensitive information.
 * @param {string} password - The password to check.
 * @param {string[]} sensitiveInfo - Array of sensitive information to check against.
 * @returns {boolean} - True if the password contains sensitive information, false otherwise.
 */
function isSensitiveInformationPresent(password, sensitiveInfo) {
  return sensitiveInfo.some((info) => password.includes(info));
}

/**
 * Checks if the password is valid.
 * @param {string} password - The password to check.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */
function isValidPassword(password) {
  if (password.length === 0) {
    throw new Error('Password cannot be empty');
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[|"/(){}?'+!@#$%^&*_;¨-])(?=.{8,})/;
  return passwordRegex.test(password);
}

/**
 * Generates a salt for hashing passwords.
 * @returns {string} - The generated salt.
 */
function generateSalt() {
  return bcrypt.genSaltSync(10);
}

/**
 * Hashes a password.
 * @param {string} password - The password to hash.
 * @returns {string} - The hashed password.
 */
function hashPassword(password) {
  try {
    const salt = generateSalt();
    return bcrypt.hashSync(password, salt);
  } catch (error) {
    throw new Error('Error hashing password');
  }
}

/**
 * Compares a plain text password with a hashed password.
 * @param {string} plainTextPassword - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password to compare.
 * @returns {boolean} - True if the passwords match, false otherwise.
 */
function comparePasswords(plainTextPassword, hashedPassword) {
  return bcrypt.compareSync(plainTextPassword, hashedPassword);
}

const username = 'admin';
const firstName = 'Admin';
const lastName = 'User';
const email = 'admin@example.com';
const password = '@Fernand1nho';

try {
  const sensitiveInfo = [username, firstName, lastName, email];

  if (!isValidPassword(password)) {
    throw new Error('Invalid password');
  }

  if (isSensitiveInformationPresent(password, sensitiveInfo)) {
    throw new Error('Password cannot contain sensitive information');
  }

  const hashedPassword = hashPassword(password.trim());
  //console.log(`Hashed password: ${hashedPassword}`);

  const isMatch = comparePasswords('@Fernand1nho', hashedPassword);
  //console.log(`Password match: ${isMatch}`);
} catch (error) {
  //console.log(error.message);
}
