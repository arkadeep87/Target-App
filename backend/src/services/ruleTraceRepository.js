class RuleTraceRepository {
  async insertRuleTrace(client, payload) {
    const result = await client.query(`insert into rule_trace (quote_id, pricing_mode, base_rate_rule_id, risk_rule_id, discount_rule_id, tax_rule_id, country_adjustment_rule_id, payment_surcharge_rule_id, underwriting_route_rule_id, configuration_snapshot_json, effective_timestamp) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now()) returning rule_trace_id`, [payload.quoteId, payload.pricingMode, payload.baseRateRuleId, payload.riskRuleId, payload.discountRuleId, payload.taxRuleId, JSON.stringify(payload.countryAdjustmentRuleIds), payload.paymentSurchargeRuleId, payload.underwritingRouteRuleId, payload.configurationSnapshotJson]);
    return result.rows[0];
  }
}

module.exports = { RuleTraceRepository };
