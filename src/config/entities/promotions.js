export default {
  tables: {
    name: 'promotions',
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
        name: 'description',
        type: 'string',
        nullable: false,
      },
      {
        name: 'start_date',
        type: 'string',
        nullable: false,
      },
      {
        name: 'end_date',
        type: 'string',
        nullable: false,
      },
      {
        name: 'id',
        type: 'object',
        nullable: false,
        isObject: true,
        relationType: '1:1',
        foreignEntity: 'coupons',
        foreignKey: 'promotion_id',
      },
      {
        name: 'fileUrl',
        type: 'string',
        nullable: true,
        extra: 'key',
      },
    ],
    backoffice: {
      icon: 'FaRocket',
    },
  },
};
