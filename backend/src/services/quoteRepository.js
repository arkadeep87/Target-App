class QuoteRepository {
  constructor({ db }) {
    this.db = db;
  }

  async nextQuoteId(client) {
    const result = await client.query(`select concat('Q', nextval('quote_id_seq')) as quote_id`);
    return result.rows[0].quote_id;
  }

  async insertQuoteHeader(client, payload) {
    const result = await client.query(`insert into quote_header (quote_id, request_id, customer_id, country_code, policy_type, coverage_amount, payment_frequency, customer_segment, consent_status, status, base_premium, risk_factor, discount_amount, tax_amount, premium_after_core_rules, country_adjustment_amount, payment_frequency_surcharge_amount, final_premium, pricing_mode, rule_trace_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) returning created_at`, [payload.quoteId, payload.requestId, payload.customerId, payload.countryCode, payload.policyType, payload.coverageAmount, payload.paymentFrequency, payload.customerSegment, payload.consentStatus, payload.status, payload.basePremium, payload.riskFactor, payload.discountAmount, payload.taxAmount, payload.premiumAfterCoreRules, payload.countryAdjustmentAmount, payload.paymentFrequencySurchargeAmount, payload.finalPremium, payload.pricingMode, payload.ruleTraceId]);
    return result.rows[0];
  }

  async insertQuoteContext(client, payload) {
    await client.query(`insert into quote_context (quote_id, customer_age, country_code, policy_type, coverage_amount, payment_frequency, customer_segment, channel_id, eligibility_outcome, eligibility_reason_code, eligibility_reason_text, country_adjustment_source, tax_rule_id, discount_rule_id, risk_rule_id, base_rate_rule_id, underwriting_route_rule_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`, [payload.quoteId, payload.customerAge, payload.countryCode, payload.policyType, payload.coverageAmount, payload.paymentFrequency, payload.customerSegment, payload.channelId, payload.eligibilityOutcome, payload.eligibilityReasonCode, payload.eligibilityReasonText, payload.countryAdjustmentSource, payload.taxRuleId, payload.discountRuleId, payload.riskRuleId, payload.baseRateRuleId, payload.underwritingRouteRuleId]);
  }

  async insertChargeLines(client, quoteId, chargeLines) {
    for (const line of chargeLines) {
      await client.query(`insert into quote_charge (quote_id, sequence_number, charge_type, charge_subtype, amount, currency_code, calculation_basis, rate_or_fixed_value, source_rule_family, source_rule_id, source_precedence_level, business_description) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, [quoteId, line.sequenceNumber, line.chargeType, line.chargeSubtype || null, line.amount, line.currencyCode || 'EUR', line.calculationBasis || null, line.rateOrFixedValue || null, line.sourceRuleFamily || null, line.sourceRuleId || null, line.sourcePrecedenceLevel || null, line.businessDescription || null]);
    }
  }

  async getQuoteDetails(quoteId) {
    const header = await this.db.query(`select * from quote_header where quote_id = $1`, [quoteId]);
    const context = await this.db.query(`select * from quote_context where quote_id = $1`, [quoteId]);
    const charges = await this.db.query(`select sequence_number as "sequenceNumber", charge_type as "chargeType", charge_subtype as "chargeSubtype", amount, currency_code as "currencyCode", calculation_basis as "calculationBasis", rate_or_fixed_value as "rateOrFixedValue", source_rule_family as "sourceRuleFamily", source_rule_id as "sourceRuleId", source_precedence_level as "sourcePrecedenceLevel", business_description as "businessDescription" from quote_charge where quote_id = $1 order by sequence_number`, [quoteId]);
    const underwriting = await this.db.query(`select status, created_at from underwriting_case where quote_id = $1`, [quoteId]);
    const audit = await this.db.query(`select event_type, business_message, reason_code, event_timestamp from audit_event where quote_id = $1 order by event_timestamp`, [quoteId]);
    const trace = await this.db.query(`select * from rule_trace where quote_id = $1`, [quoteId]);

    const h = header.rows[0];
    return {
      quoteId: h.quote_id,
      customerId: h.customer_id,
      countryCode: h.country_code,
      policyType: h.policy_type,
      coverageAmount: Number(h.coverage_amount),
      paymentFrequency: h.payment_frequency,
      customerSegment: h.customer_segment,
      consentStatus: h.consent_status,
      status: h.status,
      pricingBreakdown: {
        basePremium: Number(h.base_premium),
        riskFactor: Number(h.risk_factor),
        discountAmount: Number(h.discount_amount),
        taxAmount: Number(h.tax_amount),
        premiumAfterCoreRules: Number(h.premium_after_core_rules),
        countryAdjustmentAmount: Number(h.country_adjustment_amount),
        paymentFrequencySurchargeAmount: Number(h.payment_frequency_surcharge_amount),
        finalPremium: Number(h.final_premium),
        chargeLines: charges.rows
      },
      underwriting: underwriting.rows[0] || null,
      auditSummary: audit.rows,
      ruleTrace: trace.rows[0] || null,
      quoteContext: context.rows[0] || null
    };
  }
}

module.exports = { QuoteRepository };
