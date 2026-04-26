const db = require('../db');

async function findRule(countryCode, policyType, quoteDate) {
  const sql = `SELECT * FROM base_premium_rule
    WHERE active_flag = true
      AND effective_from <= $3
      AND (effective_to IS NULL OR effective_to >= $3)
      AND (country_code = $1 OR country_code IS NULL)
      AND (policy_type = $2 OR policy_type IS NULL)
    ORDER BY CASE WHEN country_code = $1 THEN 0 ELSE 1 END, CASE WHEN policy_type = $2 THEN 0 ELSE 1 END, priority_order ASC, version_no DESC
    LIMIT 1`;
  const result = await db.query(sql, [countryCode, policyType, quoteDate]);
  if (!result.rows[0]) throw new Error('Base premium rule resolution failed.');
  return result.rows[0];
}

module.exports = { findRule };
