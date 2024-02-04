import crypto from 'crypto';
import { getSecrets } from './secretsManager.js';
import { SECRETS } from '../../../../utils/enums/enums.js';

// Decrypting data from input
const decryptingPassword = async function (password, input) {
  try {
    // get the privateKey from aws

    const privateKey = await getSecrets(SECRETS.PRIVATE_KEY);

    // Creating a decryption based on privateKey and the password
    const decryptedPassword = crypto.privateDecrypt(
      {
        key: privateKey,

        // OAEP padding (RSA_PKCS1_OAEP_PADDING) is recommended for its enhanced security properties.
        // by incorporating additional randomness into the encryption process
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      password,
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
