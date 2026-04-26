const db = require('../db');

async function create(event) {
  const result = await db.query(
    `INSERT INTO audit_event (quote_id, request_id, customer_id, event_type, event_stage, event_message, event_outcome, correlation_id, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now()) RETURNING audit_event_id`,
    [event.quoteId, event.requestId, event.customerId, event.eventType, event.eventStage, event.eventMessage, event.eventOutcome, event.requestId]
  );
  return { audit_event_id: result.rows[0].audit_event_id };
}

module.exports = { create };
