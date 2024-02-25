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
      console.log('after buildin query', sql, values, whereColumns);
    } else {
      // in this scenario the user didnt provide an 'and' or 'or' logical operator
      // so we can assume that its an and. so we can expect only objects
      columns.push(key); // save the property
      const { whereSql, values } = buildWhereClause(filter, logicalOperator, columns);
      console.log(values, whereSql);
    }
  });

  return { processedSql: sql, processedValues: values };
}

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
