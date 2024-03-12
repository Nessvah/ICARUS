import { S3Client } from '@aws-sdk/client-s3';
//import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import config from './config.js';

const s3Client = new S3Client({
  region: config.region,
  /* credentials: fromCognitoIdentityPool({
        identityPoolId: config.identityPoolId,
    }), */
});

export default s3Client;
