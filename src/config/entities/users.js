const entity = {
  tables: {
    name: 'users',
    database: 'mongodb',
    columns: [
      {
        name: 'id',
        type: 'id',
        primaryKey: true,
        nullable: false,
      },
      {
        name: 'password',
        type: 'string',
        nullable: false,
      },
      {
        name: 'email',
        type: 'string',
        nullable: false,
      },
      {
        name: 'role_id',
        type: 'string',
        nullable: false,
        isObject: true,
        relationType: 'n:1',
        foreignEntity: 'user_role',
        foreignKey: 'id',
      },
      {
        name: 'customer_id',
        type: 'int',
        nullable: true,
      },
      {
        name: 'created_t',
        type: 'timestamp',
        nullable: true,
      },
    ],
    backoffice: {
      icon: 'FaUserFriends',
    },
  },
};

const usersBeforeResolverHook = async function () {
  const roles = ['admin', 'manager', 'user'];
  return roles.includes('admin');
};

export { entity, usersBeforeResolverHook };
