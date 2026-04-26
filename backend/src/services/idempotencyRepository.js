const db = require('../db');

async function findByKey(idempotencyKey) {
  const result = await db.query('SELECT * FROM quote_request_idempotency WHERE idempotency_key = $1', [idempotencyKey]);
  return result.rows[0] || null;
}

async function save(idempotencyKey, requestId, responsePayload) {
  await db.query(
    `INSERT INTO quote_request_idempotency (idempotency_key, request_id, response_payload, created_at)
     VALUES ($1,$2,$3,now()) ON CONFLICT (idempotency_key) DO NOTHING`,
    [idempotencyKey, requestId, responsePayload]
  );
}

module.exports = { findByKey, save };
