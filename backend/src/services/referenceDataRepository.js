class ReferenceDataRepository {
  constructor({ db }) {
    this.db = db;
  }

  async isSupportedCountry(countryCode) {
    const result = await this.db.query(`select 1 from supported_country where country_code = $1 and active_flag = true`, [countryCode]);
    return result.rows.length > 0;
  }

  async isActiveProduct(countryCode, policyType) {
    const result = await this.db.query(`select 1 from product_definition where country_code = $1 and policy_type = $2 and status = 'ACTIVE' and now() between effective_from and coalesce(effective_to, now())`, [countryCode, policyType]);
    return result.rows.length > 0;
  }

  async isActivePaymentFrequency(paymentFrequency) {
    const result = await this.db.query(`select 1 from payment_frequency_definition where payment_frequency_code = $1 and status = 'ACTIVE' and now() between effective_from and coalesce(effective_to, now())`, [paymentFrequency]);
    return result.rows.length > 0;
  }

  async getCoverageLimit(countryCode, policyType) {
    const result = await this.db.query(`select minimum_cover_amount as "minimumCoverAmount", maximum_cover_amount as "maximumCoverAmount" from product_definition where country_code = $1 and policy_type = $2 and status = 'ACTIVE' and now() between effective_from and coalesce(effective_to, now()) order by effective_from desc limit 1`, [countryCode, policyType]);
    return result.rows[0] || null;
  }

  async getReferenceDataBundle({ countryCode, effectiveDate }) {
    const countries = await this.db.query(`select country_code as "countryCode", display_name as "displayName" from supported_country where active_flag = true order by display_name`, []);
    const policyTypes = await this.db.query(`select distinct policy_type from product_definition where status = 'ACTIVE' and ($1::text is null or country_code = $1) and $2::timestamptz between effective_from and coalesce(effective_to, $2::timestamptz) order by policy_type`, [countryCode || null, effectiveDate]);
    const frequencies = await this.db.query(`select payment_frequency_code from payment_frequency_definition where status = 'ACTIVE' and $1::timestamptz between effective_from and coalesce(effective_to, $1::timestamptz) order by payment_frequency_code`, [effectiveDate]);
    const limits = await this.db.query(`select policy_type as "policyType", minimum_cover_amount as "minimumCoverAmount", maximum_cover_amount as "maximumCoverAmount" from product_definition where status = 'ACTIVE' and ($1::text is null or country_code = $1) and $2::timestamptz between effective_from and coalesce(effective_to, $2::timestamptz)`, [countryCode || null, effectiveDate]);

    return {
      supportedCountries: countries.rows,
      availablePolicyTypes: policyTypes.rows.map(r => r.policy_type),
      availablePaymentFrequencies: frequencies.rows.map(r => r.payment_frequency_code),
      productCoverageLimits: limits.rows,
      countrySpecificHints: {},
      consentTextVersion: 'v1',
      referenceVersion: 'v1'
    };
  }
}

module.exports = { ReferenceDataRepository };
