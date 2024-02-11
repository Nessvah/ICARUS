/**
 * This function will look into an object provided and will filter out
 * any undefined values.
 * @param {object} obj the object that we want to filter out undefined values
 * @returns {object} returns a new object with just key-value pairs from the original obj where
 * the values are not undefined.
 */
export function filterUndefinedValues(obj) {
  //fromEntries - [["a", 1], ["b", 2], ["c", undefined]].
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value));
}
