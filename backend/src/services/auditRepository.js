class AuditRepository {
  constructor({ db }) {
    this.db = db;
  }

  async insertAuditEvent(payload) {
    const executor = payload.client || this.db;
    const result = await executor.query(`insert into audit_event (quote_id, request_id, customer_id, event_type, business_message, reason_code, severity, payload_reference, actor_type, channel_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning audit_event_id`, [payload.quoteId, payload.requestId, payload.customerId, payload.eventType, payload.businessMessage, payload.reasonCode, payload.severity || 'WARN', payload.payloadReference || null, payload.actorType || 'SYSTEM', payload.channelId || null]);
    return result.rows[0].audit_event_id;
  }

  async getQuoteAuditTrail(quoteId) {
    const auditEvents = await this.db.query(`select * from audit_event where quote_id = $1 order by event_timestamp`, [quoteId]);
    const consentEvents = await this.db.query(`select * from consent_evidence where quote_id = $1 or quote_id is null order by created_at desc`, [quoteId]);
    const underwritingEvents = await this.db.query(`select * from underwriting_case where quote_id = $1`, [quoteId]);
    const ruleTrace = await this.db.query(`select * from rule_trace where quote_id = $1`, [quoteId]);

    return {
      quoteId,
      auditEvents: auditEvents.rows,
      consentEvents: consentEvents.rows,
      validationOutcomes: auditEvents.rows.filter(e => String(e.event_type).includes('REJECTED') || String(e.event_type).includes('VALIDATION')),
      ruleTrace: ruleTrace.rows[0] || null,
      underwritingEvents: underwritingEvents.rows
    };
  }
}

module.exports = { AuditRepository };
