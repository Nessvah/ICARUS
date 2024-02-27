const operatorsMap = {
  _eq: '=',
  _lt: '<',
  _lte: '<=',
  _gt: '>',
  _gte: '>=',
  _neq: '<>',
  _and: 'AND',
  _or: 'OR',
};

/**
 * * Processes the filter object to construct a SQL WHERE clause and corresponding values.
 *
 * @param {object} input - The input object containing filter options.
 *   @property {object} filter - An object containing filter conditions.
 *
 * @returns {object} - An object with properties:
 *   @property {string} processedSql - The processed SQL WHERE clause.
 *   @property {Array} processedValues - An array of values corresponding to the filter conditions.
 */
export function processFilter(input) {
  const logicalOperator = input.filter._or ? ' OR ' : ' AND ';
  const columns = [];
  const values = [];
  let sql = '';

  const { filter } = input;
  // check for the logical operators if present

  Object.keys(filter).forEach((key) => {
    // check for the logical operators
    if (key === '_and' || key === '_or') {
      // if we have logical operators we expect an array
      // with some nested ojects or just objects

      const { whereSql, whereValues, whereColumns } = buildWhereClause(filter[key], logicalOperator, columns);
      sql += whereSql;
      values.push(...whereValues);
      columns.push(...whereColumns); // Concatenate the arrays instead of pushing the entire array
    }
    // } else {
    //   // in this scenario the user didnt provide an 'and' or 'or' logical operator
    //   // so we can assume that its an and. so we can expect only objects
    //   columns.push(key); // save the property
    //   const { whereSql, values } = buildWhereClause(filter, logicalOperator, columns);
    //   console.log(values, whereSql);
    // }
  });

  return { processedSql: sql, processedValues: values };
}

/**
 * * Builds a SQL WHERE clause and corresponding values based on filter conditions.
 *
 * @param {object|Array} filter - The filter conditions.
 * @param {string} logicalOp - The logical operator (AND or OR).
 * @param {Array} columns - An array to store column names.
 *
 * @returns {object} - An object with properties:
 *   @property {string} whereSql - The generated SQL WHERE clause.
 *   @property {Array} whereValues - An array of values corresponding to the filter conditions.
 *   @property {Array} whereColumns - An array of column names.
 */
function buildWhereClause(filter, logicalOp, columns) {
  const whereConditions = [];
  const values = [];

  if (Array.isArray(filter)) {
    filter.forEach((obj) => {
      Object.entries(obj).forEach(([column, condition]) => {
        columns.push(column);

        for (const [operator, field] of Object.entries(condition)) {
          // eslint-disable-next-line no-prototype-builtins
          if (!operatorsMap.hasOwnProperty(operator)) {
            throw new Error('Not supported operator');
          }

          values.push(field);

          const sqlOperator = operatorsMap[operator];
          const placeholder = '?';
          const conditionStr = `${column} ${sqlOperator} ${placeholder}`;

          whereConditions.push(conditionStr);
        }
      });
    });

    return {
      whereSql: ` WHERE ${whereConditions.join(` ${logicalOp} `)}`,
      whereValues: values,
      whereColumns: [...columns],
    };
  }

  return { whereSql: '', values: [] };
}

/**
 * * Constructs a SQL pagination clause with optional LIMIT and OFFSET based on input parameters.
 *
 * @param {object} input - The input object containing pagination options.
 *   @property {number} take - The maximum number of rows to return.
 *   @property {number} skip - The number of rows to skip for pagination.
 *
 * @returns {object} - An object with properties:
 *   @property {string} paginationSql - The generated SQL pagination clause.
 *   @property {Array} paginationValues - An array of values corresponding to the pagination options.
 */
export function buildSkipAndTakeClause(input) {
  const clauses = [];
  let sql = '';

  const take = input['take'] ? 'LIMIT ?' : '';
  const skip = input['skip'] ? ', ?' : '';

  if (take && skip) {
    // add limit and offeset to query and push the values to the array
    sql += ` ${take} ${skip}`;
    clauses.push(input.skip, input.take);
  } else if (skip) {
    // if they only provide the take and no skip we need to put limit
    // as a huge number otherwise it will not work and we need to specify offset
    sql += ` LIMIT 99999999999999 OFFSET ?`;
    clauses.push(input.skip);
  } else {
    sql += ` ${take}`;
    clauses.push(input.take);
  }
  return { paginationSql: sql, paginationValues: clauses };
}
