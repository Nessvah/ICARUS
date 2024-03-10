const entity = {
  tables: {
    name: 'blog_posts',
    database: 'mongodb',
    columns: [
      {
        name: 'id',
        type: 'id',
        primaryKey: true,
        nullable: false,
      },
      {
        name: 'title',
        type: 'string',
        nullable: false,
      },
      {
        name: 'author_id',
        type: 'id',
        nullable: false,
        isObject: true,
        relationType: 'n:1',
        foreignEntity: 'authors',
        foreignKey: 'id',
      },
      {
        name: 'content',
        type: 'array',
        nullable: false,
      },
      {
        name: 'publish_date',
        type: 'date',
        nullable: false,
      },
    ],
    backoffice: {
      icon: 'FaEdit',
    },
  },
};

export { entity };
