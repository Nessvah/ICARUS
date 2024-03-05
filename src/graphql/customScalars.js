import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql';

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

const GraphQLJSON = new GraphQLScalarType({
  name: 'JSON',
  description:
    'The `JSON` scalar type represents JSON values as specified by [ECMA-404](https://ecma-international.org/publications-and-standards/standards/ecma-404/).',
  serialize: (value) => JSON.stringify(value),
  parseValue: (value) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return null;
  },
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value);
    }
    return null;
  },
});
export { GraphQLJSON };

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
    const [year, month, day] = value.split('-');
    return new Date(year, month - 1, day);
  },
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      const [year, month, day] = ast.value.split('-');
      return new Date(year, month - 1, day);
    }
    return null;
  },
});
export { MySQLDate };

export const json = () => GraphQLJSON;

// Usage examples
/* 
const mongodbDate = new Date(); // Current date
const mysqlDate = new Date('2022-01-01'); // MySQL date
const obj = { name: 'John', age: 30 }; // Object
const arr = [1, 2, 3, 4, 5]; // Array

const serializedMongodbDate = GraphQLDate.serialize(mongodbDate);
const serializedMysqlDate = MySQLDate.serialize(mysqlDate);
const serializedObj = GraphQLJSON.serialize(obj);
const serializedArr = GraphQLJSON.serialize(arr);

console.log(serializedMongodbDate); // Output: "2022-08-01T12:00:00.000Z"
console.log(serializedMysqlDate); // Output: "2022-01-01"
console.log(serializedObj); // Output: "{\"name\":\"John\",\"age\":30}"
console.log(serializedArr); // Output: "[1,2,3,4,5]"
 */
