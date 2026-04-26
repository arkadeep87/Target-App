const db = require('../db');

async function findRule(countryCode, policyType, customerAge, quoteDate) {
  const sql = `SELECT * FROM risk_model_rule
    WHERE active_flag = true
      AND effective_from <= $4
      AND (effective_to IS NULL OR effective_to >= $4)
      AND (country_code = $1 OR country_code IS NULL)
      AND (policy_type = $2 OR policy_type IS NULL)
      AND (customer_age_band IS NULL OR customer_age_band = 'ALL')
    ORDER BY migration_parity_mode_flag DESC, priority_order ASC, version_no DESC
    LIMIT 1`;
  const result = await db.query(sql, [countryCode, policyType, customerAge, quoteDate]);
  if (!result.rows[0]) throw new Error('Risk model resolution failed.');
  return result.rows[0];
}

module.exports = { findRule };
