export default {
  tables: {
    name: 'categories',
    database: 'mysql',
    columns: [
      {
        name: 'category_id',
        type: 'int',
        primaryKey: true,
        nullable: false,
        defaultValue: null,
        columnType: 'int',
        extra: 'auto_increment',
      },
      {
        name: 'category_name',
        type: 'string',
        primaryKey: false,
        nullable: false,
        defaultValue: null,
        columnType: 'string',
        extra: '',
      },
      {
        name: 'icon_class',
        type: 'string',
        primaryKey: false,
        nullable: false,
        defaultValue: "'FaTags'",
        columnType: 'string',
        extra: '',
      },
      {
        name: 'icon_label',
        type: 'string',
        primaryKey: false,
        nullable: false,
        defaultValue: "'Category'",
        columnType: 'string',
        extra: 'key',
      },
    ],
    backoffice: {
      icon: 'FaTags',
    },
  },
};
