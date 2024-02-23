import knex from 'knex';
const db = knex({
  client: 'mysql2',
  connection: {
    host: '16.171.102.168',
    user: 'icarus_devs',
    password: 'YP6w@gsuJLe^kS',
    database: 'icarus',
    port: 3306,
  },
});

class QueryBuilder {
  constructor(table) {
    this.table = table;
  }

  applyQueryFilters(QUERY, filters, unionOperator) {
    Object.keys(filters).forEach((key) => {
      if (key === '_and' || key === '_or') {
        const value = filters[key] || [];
        let where = 'where';

        if (key === '_or') {
          where = 'orWhere';
        } else if (key === '_and') {
          where = 'andWhere';
        }

        value.forEach((entry) => {
          const newFilters = {};
          const entryKey = Object.keys(entry)[0];
          newFilters[entryKey] = entry[entryKey];
          QUERY[where](this.operatorMatcher(newFilters, 'and'));
        });
      } else {
        const OPERATOR = Object.keys(filters[key])[0];

        this.operatorMatcher(filters[key], OPERATOR)(QUERY);
      }
    });

    return QUERY;
  }

  operatorMatcher(filter, operator) {
    return (Q) => {
      const entryKey = Object.keys(filter)[0];
      const filterValue = filter[entryKey];

      switch (operator) {
        case '_eq':
          return Q[entryKey](filterValue);
        case '_neq':
          return Q[`${entryKey}Not`](filterValue);
        case '_lt':
          return Q[entryKey](knex.raw(`< ?`, [filterValue]));
        case '_lte':
          return Q[entryKey](knex.raw(`<= ?`, [filterValue]));
        case '_gt':
          return Q[entryKey](knex.raw(`> ?`, [filterValue]));
        case '_gte':
          return Q[entryKey](knex.raw(`>= ?`, [filterValue]));
        case '_in':
          return Q[`${entryKey}In`](filterValue);
        case '_nin':
          return Q[`${entryKey}NotIn`](filterValue);
        case '_like':
          return Q[entryKey](knex.raw(`like ?`, [`%${filterValue}%`]));
        case '_nlike':
          return Q[entryKey](knex.raw(`not like ?`, [`%${filterValue}%`]));
        case '_is_null':
          return Q[`${entryKey}Null`]();
        default:
          throw new Error(`Operator ${operator} is not supported.`);
      }
    };
  }

  async find(filter) {
    const query = db(this.table);
    this.applyQueryFilters(query, filter);

    try {
      const result = await query;
      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
