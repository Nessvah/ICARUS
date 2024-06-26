export default {
  tables: {
    name: 'coupons',
    database: 'mongodb',
    columns: [
      {
        name: 'id',
        type: 'id',
        primaryKey: true,
        nullable: false,
      },
      {
        name: 'code',
        type: 'string',
        nullable: false,
      },
      {
        name: 'discount_percent',
        type: 'int',
        nullable: false,
      },
      {
        name: 'expiration_date',
        type: 'string',
        nullable: false,
      },
      {
        name: 'promotion_id',
        type: 'id',
        nullable: false,
        isObject: true,
        relationType: '1:1',
        foreignEntity: 'promotions',
        foreignKey: 'id',
      },
      {
        name: 'fileUrl',
        type: 'string',
        nullable: true,
        extra: 'key',
      },
    ],
    backoffice: {
      icon: 'FaTicketAlt',
    },
  },
};
