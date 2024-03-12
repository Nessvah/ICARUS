const entity = {
  tables: {
    name: 'orders',
    database: 'mysql',
    columns: [
      {
        name: 'order_id',
        type: 'int',
        primaryKey: true,
        nullable: false,
        defaultValue: null,
        columnType: 'int',
        extra: 'auto_increment',
      },
      {
        name: 'order_date',
        type: 'timestamp',
        primaryKey: false,
        nullable: false,
        defaultValue: "'CURRENT_string'",
        columnType: 'string',
        extra: 'DEFAULT_GENERATED',
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
        name: 'icon_class',
        type: 'string',
        primaryKey: false,
        nullable: true,
        defaultValue: "'FaCartShopping'",
        columnType: 'string',
        extra: '',
      },
      {
        name: 'icon_label',
        type: 'string',
        primaryKey: false,
        nullable: true,
        defaultValue: "'Order'",
        columnType: 'string',
        extra: '',
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
        foreignKey: 'order_id',
      },
      {
        name: 'shipments',
        type: 'object',
        primaryKey: false,
        nullable: true,
        defaultValue: null,
        columnType: 'object',
        extra: 'MUL',
        isObject: true,
        relationType: '1:1',
        foreignEntity: 'shipments',
        foreignKey: 'order_id',
      },
      {
        name: 'payment',
        type: 'object',
        primaryKey: false,
        nullable: true,
        defaultValue: null,
        columnType: 'object',
        extra: 'MUL',
        isObject: true,
        relationType: '1:1',
        foreignEntity: 'payment',
        foreignKey: 'order_id',
      },
    ],
    backoffice: {
      icon: 'FaShippingFast',
      currency: 'euro',
    },
  },
};

const orders_create = async function (args) {
  const currentDate = new Date();
  args.input._create.order_date = currentDate;
  return args;
};

export { entity, orders_create };
