const db = require('../db');

async function findRules(countryCode, policyType, paymentFrequency, quoteDate) {
  const sql = `SELECT * FROM country_adjustment_rule
    WHERE country_code = $1
      AND active_flag = true
      AND effective_from <= $4
      AND (effective_to IS NULL OR effective_to >= $4)
      AND (policy_type = $2 OR policy_type IS NULL)
      AND (payment_frequency = $3 OR payment_frequency IS NULL)
      AND precedence_source = 'CONFIGURED'
    ORDER BY priority_order ASC, version_no DESC`;
  const result = await db.query(sql, [countryCode, policyType, paymentFrequency, quoteDate]);
  return result.rows;
}

async function findFallbackAmount() {
  return 0;
}

module.exports = { findRules, findFallbackAmount };
