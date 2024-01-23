import sql from 'mssql';

async function getProducts(user) {
  if (!user) {
    throw new Error('Invalid authorization');
  }
  try {
    const results = await sql.query('SELECT TOP 100 * FROM Product');
    // console.log('res', results);
    return results.recordset;
  } catch (error) {
    //console.error('Error executing SQL query:', error);
  }
}

export { getProducts };
