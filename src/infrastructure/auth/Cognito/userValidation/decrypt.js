import crypto from 'crypto';
import { getSecrets } from './secretsManager.js';
import { SECRETS } from '../../../../utils/enums/enums.js';
//import { getSecrets } from './secretsManager.js';
//import { SECRETS } from '../../../../utils/enums/enums.js';

//const privateKey = process.env.privateKeyBackend;
// Decrypting data from input
const decryptingPassword = async function (input) {
  //console.log('input', input);
  const encryptedDataBuffer = Buffer.from(input.password, 'base64');
  const { email } = input;

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

        // OAEP padding (RSA_PKCS1_OAEP_PADDING) is recommended for its enhanced security properties.
        // by incorporating additional randomness into the encryption process
        /* padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256', */
      },
      encryptedDataBuffer,
    );

    // Sending the correct object response with password decrypted
    // to verify the password and email
    const decryptedDataResponse = {
      email,
      password: decryptedPassword.toString('utf8'),
    };

    return decryptedDataResponse;
  } catch (e) {
    throw new Error('Error decrypting data');
  }
};

export { decryptingPassword };
