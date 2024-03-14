export default {
  tables: {
    name: 'payment',
    database: 'mongodb',
    columns: [
      {
        name: 'id',
        type: 'string',
        primaryKey: true,
        nullable: false,
      },
      {
        name: 'payment_method',
        type: 'string',
        nullable: false,
      },
      {
        name: 'payment_date',
        type: 'string',
        nullable: false,
      },
      {
        name: 'amount',
        type: 'float',
        nullable: false,
      },
      {
        name: 'payment_status',
        type: 'string',
        nullable: false,
      },
      {
        name: 'order_id',
        type: 'int',
        primaryKey: false,
        nullable: true,
        defaultValue: null,
        columnType: 'object',
        extra: 'MUL',
        isObject: true,
        relationType: '1:1',
        foreignEntity: 'orders',
        foreignKey: 'order_id',
      },
      {
        name: 'fileUrl',
        type: 'string',
        nullable: true,
        extra: 'key',
      },
    ],
    backoffice: {
      icon: 'FaCreditCard',
      currency: 'euro',
    },
  },
  hooks: {
    query: '',
    _update: '',
    _create: {
      async beforeQuery(props) {
        const currentDate = new Date();
        props.args.input._create.payment_date = currentDate;
        return props;
      },
    },
    _delete: '',
  },
};
