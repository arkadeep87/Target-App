const db = require('../db');

async function findRule(countryCode, policyType, customerSegment, quoteDate) {
  const sql = `SELECT * FROM discount_rule
    WHERE active_flag = true
      AND effective_from <= $4
      AND (effective_to IS NULL OR effective_to >= $4)
      AND (country_code = $1 OR country_code IS NULL)
      AND (policy_type = $2 OR policy_type IS NULL)
      AND (customer_segment = $3 OR customer_segment IS NULL)
    ORDER BY migration_parity_mode_flag DESC, priority_order ASC, version_no DESC
    LIMIT 1`;
  const result = await db.query(sql, [countryCode, policyType, customerSegment, quoteDate]);
  if (!result.rows[0]) throw new Error('Discount rule resolution failed.');
  return result.rows[0];
}

module.exports = { findRule };
