const entity = {
  tables: {
    name: 'user_role',
    database: 'mongodb',
    columns: [
      {
        name: 'id',
        type: 'id',
        primaryKey: true,
        nullable: false,
      },
      {
        name: 'role_name',
        type: 'string',
        nullable: false,
      },
      {
        name: 'id',
        type: 'object',
        nullable: false,
        isObject: true,
        relationType: '1:n',
        foreignEntity: 'users',
        foreignKey: 'role_id',
      },
    ],
    backoffice: {
      icon: 'FaCrown',
    },
  },
};
