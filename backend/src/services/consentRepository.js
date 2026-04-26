const db = require('../db');

async function saveGrantedConsent(request) {
  return db.query(
    `INSERT INTO consent_evidence (customer_id, quote_id, request_id, country_code, consent_status, consent_required_flag, evidence_type, evidence_message, captured_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now())`,
    [request.customerId, null, request.requestId, request.countryCode, 'GRANTED', true, 'GDPR_CONSENT', 'Consent granted for quote processing']
  );
}

module.exports = { saveGrantedConsent };
