export default {
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
      {
        name: 'fileUrl',
        type: 'string',
        nullable: true,
        extra: 'key',
      },
    ],
    backoffice: {
      icon: 'FaIdCardAlt',
    },
  },
  /* hooks: {
    count: {
      async afterQuery(props) {
        props.res = 10;
        return props;
      },
    },
  }, */
};
