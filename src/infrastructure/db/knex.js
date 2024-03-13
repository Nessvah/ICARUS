export class MySQLConnection {
  constructor(pools) {
    this.pools = pools;
  }
  async find(tableName, { input }) {
    const { filter } = input;
    try {
      const query = this.pools[tableName];
      if (!query) {
        throw new Error(`Table '${tableName}' does not exist.`);
      }
      if (filter) {
        return await query.where(filter)();
      } else {
        return await query();
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async create(tableName, { input }) {
    const { create } = input;
    try {
      const res = await this.pools.find((pool) => pool.table === tableName).insert(create);
      return { created: res };
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async update(tableName, { input }) {
    const { filter, update } = input;
    try {
      const res = await this.pools
        .find((pool) => pool.table === tableName)
        .where(filter)
        .update(update);
      return { updated: res };
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async delete(tableName, { input }) {
    const { filter } = input;
    try {
      const res = await this.pools
        .find((pool) => pool.table === tableName)
        .where(filter)
        .del();
      return { deleted: res };
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
}
