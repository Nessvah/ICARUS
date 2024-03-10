const entity = {
  tables: {
    name: 'authors',
    database: 'mongodb',
    columns: [
      {
        name: 'id',
        type: 'id',
        primaryKey: true,
        nullable: false,
      },
      {
        name: 'name',
        type: 'string',
        nullable: false,
      },
      {
        name: 'email',
        type: 'string',
        nullable: false,
      },
      {
        name: 'id',
        type: 'object',
        nullable: false,
        isObject: true,
        relationType: '1:n',
        foreignEntity: 'blog_posts',
        foreignKey: 'author_id',
      },
    ],
    backoffice: {
      icon: 'FaIdCardAlt',
    },
  },
};

export { entity };
