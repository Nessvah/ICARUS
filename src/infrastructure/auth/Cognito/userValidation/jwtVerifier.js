import { CognitoJwtVerifier } from 'aws-jwt-verify';
import winston from 'winston/lib/winston/config';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
const tokenVerifier = async function (accessToken) {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.UserPoolId,
    tokenUse: 'access',
    clientId: process.env.ClientId,
  });

  try {
    const payload = await verifier.verify(accessToken);
    logger.info('Token is valid. Payload: ', payload);
    return true;
  } catch (e) {
    logger.error('Token is invalid: ', e);
    throw new Error('Error in token validation: ', e);
  }
};

export { tokenVerifier };
