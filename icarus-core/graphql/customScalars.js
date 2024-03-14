import { GraphQLScalarType, Kind } from 'graphql';

/**
 ** Custom GraphQL scalar representing a date and time in ISO-8601 string format.
 * @type {GraphQLScalarType}
 */
const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A date and time, represented as an ISO-8601 string',
  serialize: (value) => value.toISOString(),
  parseValue: (value) => new Date(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});
export { GraphQLDate };

/**
 ** Custom GraphQL scalar representing a date in MySQL format (YYYY-MM-DD).
 * @type {GraphQLScalarType}
 */
const MySQLDate = new GraphQLScalarType({
  name: 'MySQLDate',
  description: 'A date in MySQL format (YYYY-MM-DD)',
  serialize: (value) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  parseValue: (value) => {
    const [year, month, day] = value.split('-').map((v) => parseInt(v, 10));
    return new Date(year, month - 1, day);
  },
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      const [year, month, day] = ast.value.split('-').map((v) => parseInt(v, 10));
      return new Date(year, month - 1, day);
    }
    return null;
  },
});
export { MySQLDate };

// Usage examples
/* 
const mongodbDate = new Date(); // Current date
const mysqlDate = new Date('2022-01-01'); // MySQL date

const serializedMongodbDate = GraphQLDate.serialize(mongodbDate);
const serializedMysqlDate = MySQLDate.serialize(mysqlDate);

console.log(serializedMongodbDate); // Output: "2022-08-01T12:00:00.000Z"
console.log(serializedMysqlDate); // Output: "2022-01-01"
 */
