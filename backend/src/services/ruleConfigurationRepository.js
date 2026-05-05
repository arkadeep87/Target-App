class RuleConfigurationRepository {
  constructor({ db }) {
    this.db = db;
  }

  async getOperatingMode() {
    const result = await this.db.query(`select pricing_mode from operating_mode_configuration where active_flag = true and now() between effective_from and coalesce(effective_to, now()) order by effective_from desc limit 1`, []);
    return result.rows[0]?.pricing_mode || null;
  }

  async getBaseRateRule({ pricingMode }) {
    const result = await this.db.query(`select * from base_rate_configuration where pricing_mode = $1 and active_flag = true and now() between effective_from and coalesce(effective_to, now()) order by effective_from desc limit 1`, [pricingMode]);
    return result.rows[0] || null;
  }

  async getRiskRule({ request }) {
    const result = await this.db.query(`select * from risk_rule_configuration where country_code = $1 and policy_type = $2 and $3 between age_band_from and age_band_to and $4 between coverage_band_from and coverage_band_to and customer_segment = $5 and active_flag = true and now() between effective_from and coalesce(effective_to, now()) order by effective_from desc limit 1`, [request.countryCode, request.policyType, request.customerAge, request.coverageAmount, request.customerSegment]);
    return result.rows[0] || null;
  }

  async getDiscountRule({ request, pricingMode }) {
    const result = await this.db.query(`select * from discount_rule_configuration where operating_mode = $1 and (country_code = $2 or country_code is null) and (policy_type = $3 or policy_type is null) and active_flag = true and now() between effective_from and coalesce(effective_to, now()) order by country_code nulls last, policy_type nulls last, effective_from desc limit 1`, [pricingMode, request.countryCode, request.policyType]);
    return result.rows[0] || null;
  }

  async getTaxRule({ request, pricingMode }) {
    const result = await this.db.query(`select * from tax_rule_configuration where operating_mode = $1 and country_code = $2 and (policy_type = $3 or policy_type is null) and active_flag = true and now() between effective_from and coalesce(effective_to, now()) order by policy_type nulls last, effective_from desc limit 1`, [pricingMode, request.countryCode, request.policyType]);
    return result.rows[0] || null;
  }

  async getEligibilityRule(request) {
    const result = await this.db.query(`select * from eligibility_rule_configuration where country_code = $1 and policy_type = $2 and customer_segment = $3 and active_flag = true and now() between effective_from and coalesce(effective_to, now()) order by effective_from desc limit 1`, [request.countryCode, request.policyType, request.customerSegment]);
    return result.rows[0] || null;
  }

  async getCountryAdjustmentComponents({ request, sourceSystem }) {
    const result = await this.db.query(`select * from country_adjustment_configuration where country_code = $1 and (policy_type = $2 or policy_type is null) and (payment_frequency = $3 or payment_frequency is null) and source_system = $4 and active_flag = true and now() between effective_from and coalesce(effective_to, now()) order by priority_order asc, effective_from desc`, [request.countryCode, request.policyType, request.paymentFrequency, sourceSystem]);
    return result.rows;
  }

  async getPaymentSurchargeRule({ request, pricingMode }) {
    const result = await this.db.query(`select * from payment_surcharge_configuration where operating_mode = $1 and payment_frequency_code = $2 and active_flag = true and now() between effective_from and coalesce(effective_to, now()) order by effective_from desc limit 1`, [pricingMode, request.paymentFrequency]);
    return result.rows[0] || null;
  }

  async getUnderwritingRoute({ request }) {
    const result = await this.db.query(`select * from underwriting_route_configuration where country_code = $1 and active_flag = true and now() between effective_from and coalesce(effective_to, now()) order by effective_from desc limit 1`, [request.countryCode]);
    return result.rows[0] || null;
  }

  async getConsentPolicy() {
    const result = await this.db.query(`select * from consent_policy_configuration where active_flag = true and now() between effective_from and coalesce(effective_to, now()) order by effective_from desc limit 1`, []);
    return result.rows[0] || { non_consent_outcome: 'REJECT_AFTER_AUDIT' };
  }
}

module.exports = { RuleConfigurationRepository };
