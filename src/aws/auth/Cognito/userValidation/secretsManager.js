import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { config } from '../../../config/config.js';

const { SECRET_NAME } = process.env;
const client = new SecretsManagerClient(config);

/**
 *  This function will access secrets manager from aws to get the pub/private keys
 * @param {string} key the type of key - public or private
 * @returns the key already in a string format
 */
const getSecrets = async (key) => {
  const input = {
    SecretId: SECRET_NAME,
    VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
  };

  let response;

  try {
    // be default the aws secrets manager will send all the secrets in there
    const command = new GetSecretValueCommand(input);
    response = await client.send(command);

    // get the secret value as a string
    const secrets = response.SecretString;

    // convert to obj and get the key needed
    const secretsParsed = JSON.parse(secrets);

    if (key === 'public') {
      return secretsParsed.publicKey;
    }

    return secretsParsed.privateKey;
  } catch (e) {
    if (e.name === 'InternalServiceError') {
      throw new Error('An error occured on the server side.');
    }

    throw new Error('Something went wrong with getting secrets');
  }
};

export { getSecrets };
