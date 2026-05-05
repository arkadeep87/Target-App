const { Pool } = require('pg');

class Db {
  constructor(connectionString) {
    this.pool = new Pool({ connectionString });
  }

  async query(text, params) {
    return this.pool.query(text, params);
  }

  async withTransaction(work) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = { Db };
