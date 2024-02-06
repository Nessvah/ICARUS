import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { config } from '../../../../aws/config.js';

const { SECRET_NAME } = process.env;
const client = new SecretsManagerClient(config);

// function to get the public key to send to the FE client
const getSecrets = async (key) => {
  const input = {
    SecretId: SECRET_NAME,
    VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
  };

  let response;

  try {
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

    throw new Error('aws shit');
  }
};

export { getSecrets };
