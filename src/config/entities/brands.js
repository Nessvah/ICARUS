export default {
  tables: {
    name: 'brands',
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
        name: 'country',
        type: 'string',
        nullable: false,
      },
      {
        name: 'founded_year',
        type: 'string',
        nullable: false,
      },
      {
        name: 'products',
        type: 'array',
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
      icon: 'FaBlackTie',
    },
  },
};
