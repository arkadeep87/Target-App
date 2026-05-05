class UnderwritingRepository {
  async insertUnderwritingCase(client, payload) {
    const result = await client.query(`insert into underwriting_case (quote_id, customer_id, country_code, status, route_reason, route_rule_id, created_by_service) values ($1,$2,$3,$4,$5,$6,$7) returning underwriting_case_id, status, created_at`, [payload.quoteId, payload.customerId, payload.countryCode, payload.status, payload.routeReason, payload.routeRuleId, payload.createdByService]);
    return {
      underwritingCaseId: result.rows[0].underwriting_case_id,
      status: result.rows[0].status,
      createdAt: result.rows[0].created_at
    };
  }
}

module.exports = { UnderwritingRepository };
