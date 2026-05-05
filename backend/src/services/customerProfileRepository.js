class CustomerProfileRepository {
  constructor({ db }) {
    this.db = db;
  }

  async isActiveCustomer(customerId) {
    const result = await this.db.query(`select 1 from customer_profile where customer_id = $1 and status = 'ACTIVE'`, [customerId]);
    return result.rows.length > 0;
  }
}

module.exports = { CustomerProfileRepository };
