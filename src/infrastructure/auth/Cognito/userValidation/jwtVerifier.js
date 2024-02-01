import { CognitoJwtVerifier } from 'aws-jwt-verify';

const tokenVerifier = async function (accessToken) {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.UserPoolId,
    tokenUse: 'access',
    clientId: process.env.ClientId,
  });

  try {
    const payload = await verifier.verify(accessToken);
    console.log('Token is valid. Payload: ', payload);
    return true;
  } catch (e) {
    console.log('Token is invalid');
    throw new Error('Error in token validation: ', e);
  }
};

export { tokenVerifier };
