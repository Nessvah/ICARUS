import { GraphQLDate, MySQLDate } from '../../icarus-core/graphql/customScalars';

describe('Custom Scalars', () => {
  describe('GraphQLDate', () => {
    it('should serialize a date to ISO-8601 string', () => {
      const date = new Date('2022-08-01T12:00:00.000Z');
      const serializedDate = GraphQLDate.serialize(date);
      expect(serializedDate).toBe('2022-08-01T12:00:00.000Z');
    });
  });

  describe('MySQLDate', () => {
    it('should serialize a date to MySQL format (YYYY-MM-DD)', () => {
      const date = new Date('2022-08-01T12:00:00.000Z');
      const serializedDate = MySQLDate.serialize(date);
      expect(serializedDate).toBe('2022-08-01');
    });
  });
});
