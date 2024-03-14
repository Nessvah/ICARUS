export default {
  tables: {
    name: 'product_reviews',
    database: 'mysql',
    columns: [
      {
        name: 'review_id',
        type: 'int',
        primaryKey: true,
        nullable: false,
        defaultValue: null,
        columnType: 'int',
        extra: 'auto_increment',
      },
      {
        name: 'product_id',
        type: 'int',
        primaryKey: false,
        nullable: false,
        defaultValue: null,
        columnType: 'object',
        extra: 'MUL',
        isObject: true,
        relationType: 'n:1',
        foreignEntity: 'products',
        foreignKey: 'product_id',
      },
      {
        name: 'customer_id',
        type: 'int',
        primaryKey: false,
        nullable: false,
        defaultValue: null,
        columnType: 'object',
        extra: 'MUL',
        isObject: true,
        relationType: 'n:1',
        foreignEntity: 'customers',
        foreignKey: 'customer_id',
      },
      {
        name: 'rating',
        type: 'int',
        primaryKey: false,
        nullable: false,
        defaultValue: null,
        columnType: 'int',
        extra: '',
      },
      {
        name: 'review_text',
        type: 'string',
        primaryKey: false,
        nullable: false,
        defaultValue: null,
        columnType: 'string',
        extra: '',
      },
      {
        name: 'review_date',
        type: 'date',
        primaryKey: false,
        nullable: false,
        defaultValue: "'CURRENT_string'",
        columnType: 'string',
        extra: 'DEFAULT_GENERATED',
      },
      {
        name: 'icon_class',
        type: 'string',
        primaryKey: false,
        nullable: true,
        defaultValue: "'FaFaceGrinStars'",
        columnType: 'string',
        extra: '',
      },
      {
        name: 'icon_label',
        type: 'string',
        primaryKey: false,
        nullable: true,
        defaultValue: "'Product Review'",
        columnType: 'string',
        extra: '',
      },
    ],
    backoffice: {
      icon: 'FaStar',
    },
  },
};

/* const product_reviews_create = async function (args) {
  const currentDate = new Date();
  args.input._create.review_date = currentDate;
  return args;
}; */
