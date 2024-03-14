export default {
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
      {
        name: 'fileUrl',
        type: 'string',
        nullable: true,
        extra: 'key',
      },
    ],
    backoffice: {
      icon: 'FaEdit',
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
    _update: {
      async beforeQuery(props) {
        return;
      },
    },
    _create: {
      async beforeQuery(props) {
        const currentDate = new Date();
        props.args.input._create.publish_date = currentDate;
        return props;
      },
    },
    _delete: '',
  },
};

/* const blog_posts_create = async function (args) {
  const currentDate = new Date();
  args.input._create.publish_date = currentDate;
  return args;
};
 */
