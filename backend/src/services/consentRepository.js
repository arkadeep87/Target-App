class ConsentRepository {
  constructor({ db }) {
    this.db = db;
  }

  async insertConsentEvidence(payload) {
    const result = await this.db.query(`insert into consent_evidence (quote_id, customer_id, consent_status, consent_text_version, consent_captured_at, channel_id, processing_outcome, audit_message, request_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning consent_evidence_id, created_at`, [payload.quoteId, payload.customerId, payload.consentStatus, 'v1', payload.consentCapturedAt, payload.channelId, payload.processingOutcome, payload.auditMessage, payload.requestId]);
    return result.rows[0];
  }
}

module.exports = { ConsentRepository };
