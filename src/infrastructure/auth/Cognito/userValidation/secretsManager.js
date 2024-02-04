import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const { SECRET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, REGION } = process.env;

const client = new SecretsManagerClient({
  region: REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

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

    throw new Error(e);
  }
};

export { getSecrets };
