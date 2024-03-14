export default {
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
      {
        name: 'fileUrl',
        type: 'string',
        nullable: true,
        extra: 'key',
      },
    ],
    backoffice: {
      icon: 'FaUserFriends',
    },
  },
  hooks: {
    all: {
      async beforeResolver(props) {
        const roles = ['admin', 'manager', 'user'];
        if (!roles.includes('admin')) throw new Error('User not authorized to make this query');
      },
      beforeQuery: '',
      afterQuery: '',
      afterResolver: '',
    },
    query: '',
    _update: '',
    _create: {
      async beforeQuery(props) {
        const currentDate = new Date();
        props.args.input._create.created_t = currentDate;
        return props;
      },
    },
    _delete: '',
  },
};
