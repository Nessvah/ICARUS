import crypto from 'crypto';

// Decrypting data from input

const decryptingPassword = function (input, password) {
  try {
    console.log('to aqui');
    let decryptedPassword = crypto.privateDecrypt(
      {
        key: process.env.privateKeyBackend,
        format: 'pem',
      },
      password,
    );
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
