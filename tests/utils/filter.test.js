import { filterUndefinedValues } from '../../src/utils/filter';

describe('filterUndefinedValues()', () => {
  it('returns a new object without undefined values', () => {
    const obj = {
      a: 1,
      b: 2,
      c: undefined,
      d: null, // Should be filtered out
      e: 0, // Should be filtered out
    };

    const filteredObj = filterUndefinedValues(obj);
    expect(filteredObj).toEqual({ a: 1, b: 2 });
  });

  it('returns an empty object if all values are undefined', () => {
    const obj = {
      a: undefined,
      b: undefined,
      c: undefined,
      d: undefined,
    };

    const filteredObj = filterUndefinedValues(obj);
    expect(filteredObj).toEqual({});
  });
});
