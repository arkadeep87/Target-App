const db = require('../db');

async function findRule(countryCode, paymentFrequency, quoteDate) {
  const sql = `SELECT csr.surcharge_percent, psr.version_no
    FROM payment_surcharge_rule csr
    JOIN payment_schedule_reference psr ON psr.payment_schedule_reference_id = csr.payment_schedule_reference_id
    WHERE psr.country_code = $1
      AND psr.payment_frequency = $2
      AND psr.active_flag = true
      AND csr.active_flag = true
      AND psr.effective_from <= $3
      AND (psr.effective_to IS NULL OR psr.effective_to >= $3)
      AND csr.effective_from <= $3
      AND (csr.effective_to IS NULL OR csr.effective_to >= $3)
    ORDER BY csr.version_no DESC
    LIMIT 1`;
  const result = await db.query(sql, [countryCode, paymentFrequency, quoteDate]);
  return result.rows[0] || null;
}

module.exports = { findRule };
