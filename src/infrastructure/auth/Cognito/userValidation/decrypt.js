import crypto from 'crypto';

// Decrypting data from input
const decryptingPassword = function (password, input) {
  try {
    // Creating a decryption based on privateKey and the password
    let decryptedPassword = crypto.privateDecrypt(
      {
        key: process.env.privateKeyBackend,
        format: 'pem',
      },
      password,
    );
    // Sending the correct object response with password decrypted
    // to verify the password and email
    let decryptedDataResponse = {
      email: input.email,
      password: decryptedPassword.toString('utf8'),
    };
    return decryptedDataResponse;
  } catch (e) {
    throw new Error('Error decrypting data');
  }
};

export { decryptingPassword };
