import {
  ListUsersInGroupCommand,
  CognitoIdentityProviderClient,
  ListGroupsCommand,
} from '@aws-sdk/client-cognito-identity-provider';

// Create a Cognito Identity Provider Client with necessary configurations
const client = new CognitoIdentityProviderClient({
  region: process.env.region,
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});

const listAllGroups = async (client) => {
  const command = new ListGroupsCommand({
    UserPoolId: process.env.UserPoolId,
  });
  return client.send(command);
};

const getUserPerGroup = async (client, group) => {
  const command = new ListUsersInGroupCommand({
    UserPoolId: process.env.UserPoolId,
    GroupName: group,
  });
  return client.send(command);
};

const getRolesPerUser = async () => {
  try {
    const allGroupsResponse = await listAllGroups(client);
    const allGroups = allGroupsResponse.Groups.map((group) => group.GroupName);

    const userRolesMap = {}; // Map to store user roles by email

    for (const group of allGroups) {
      const usersPerGroup = await getUserPerGroup(client, group);
      for (const user of usersPerGroup.Users) {
        const emailAttribute = user.Attributes.find((Attribute) => Attribute.Name === 'email');
        const emailValue = emailAttribute ? emailAttribute.Value : null;
        const idAttribute = user.Attributes.find((Attribute) => Attribute.Name === 'custom:customer_id');
        const idValue = idAttribute ? idAttribute.Value : null;
        const created = user.UserCreateDate;

        if (!userRolesMap[emailValue]) {
          userRolesMap[emailValue] = {
            email: emailValue,
            roles: [],
            created,
            id: idValue,
          };
        }

        userRolesMap[emailValue].roles.push(group);
      }
    }

    const resultArray = Object.values(userRolesMap); // Convert map values to an array

    return resultArray;
  } catch (e) {
    throw new Error(e);
  }
};

export { getRolesPerUser };
