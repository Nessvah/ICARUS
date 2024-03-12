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

const usersPermissionQuery = async function (context) {
  const roles = ['admin', 'manager', 'user'];
  if (!roles.includes('admin')) return false;
  return true;
};

const usersPermissionMutation = async function () {
  const roles = ['admin', 'manager', 'user'];
  if (!roles.includes('admin')) return false;
  return true;
};

const users_create = async function (args) {
  const currentDate = new Date();
  args.input._create.created_t = currentDate;
  return args;
};

const users_update = async function () {
  const currentDate = new Date();
};

export { entity, usersPermissionQuery, users_create, users_update, usersPermissionMutation };
