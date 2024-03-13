const entity = {
  tables: {
    name: 'products',
    database: 'mysql',
    columns: [
      {
        name: 'product_id',
        type: 'int',
        primaryKey: true,
        nullable: false,
        defaultValue: null,
        columnType: 'int',
        extra: 'auto_increment',
      },
      {
        name: 'product_name',
        type: 'string',
        primaryKey: false,
        nullable: false,
        defaultValue: null,
        columnType: 'string',
        extra: '',
      },
      {
        name: 'price',
        type: 'float',
        primaryKey: false,
        nullable: false,
        defaultValue: null,
        columnType: 'float',
        extra: '',
      },
      {
        name: 'currency_type',
        type: 'string',
        primaryKey: false,
        nullable: false,
        defaultValue: 'EUR',
        columnType: 'VARCHAR',
        extra: '',
      },
      {
        name: 'description',
        type: 'string',
        primaryKey: false,
        nullable: true,
        defaultValue: null,
        columnType: 'string',
        extra: '',
      },
      {
        name: 'icon_class',
        type: 'string',
        primaryKey: false,
        nullable: true,
        defaultValue: "'FaBoxOpen'",
        columnType: 'string',
        extra: '',
      },
      {
        name: 'icon_label',
        type: 'string',
        primaryKey: false,
        nullable: true,
        defaultValue: "'Product'",
        columnType: 'string',
        extra: 'key',
      },
      {
        name: 'order_items',
        type: 'object',
        primaryKey: false,
        nullable: true,
        defaultValue: null,
        columnType: 'object',
        extra: 'MUL',
        isObject: true,
        relationType: '1:n',
        foreignEntity: 'order_items',
        foreignKey: 'product_id',
      },
    ],
    backoffice: {
      icon: 'FaKaaba',
      currency: 'euro',
    },
  },
};

export { entity };
