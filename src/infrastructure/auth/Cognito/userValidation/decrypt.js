import crypto from 'crypto';
import { getSecrets } from './secretsManager.js';
import { SECRETS } from '../../../../utils/enums/enums.js';

// Decrypting data from input
const decryptingPassword = async function (input) {
  const encryptedDataBuffer = Buffer.from(input.password, 'base64');
  try {
    // get the privateKey from aws
    let privateKey = await getSecrets(SECRETS.PRIVATE_KEY);
    // Replace spaces with line breaks
    privateKey = privateKey.replace(/\s/g, '\n');

    // Add header and footer
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;

    // Creating a decryption based on privateKey and the password
    const decryptedPassword = crypto.privateDecrypt(
      {
        key: privateKey,
        format: 'pem',
      },
      encryptedDataBuffer,
    );

    // Sending the correct object response with password decrypted
    // to verify the password and email
    const decryptedDataResponse = {
      email: input.email,
      password: decryptedPassword.toString('utf8'),
    };
    return decryptedDataResponse;
  } catch (e) {
    throw new Error('Error decrypting data');
  }
};

export { decryptingPassword };
