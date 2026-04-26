const db = require('../db');

async function findEffectiveRule({ countryCode, policyType, customerAge, coverageAmount, quoteDate }) {
  const sql = `SELECT * FROM eligibility_rule
    WHERE country_code = $1
      AND policy_type = $2
      AND active_flag = true
      AND effective_from <= $3
      AND (effective_to IS NULL OR effective_to >= $3)
      AND min_age <= $4
      AND (max_age IS NULL OR max_age >= $4)
      AND min_coverage_amount <= $5
      AND (max_coverage_amount IS NULL OR max_coverage_amount >= $5)
    ORDER BY priority_order ASC, version_no DESC
    LIMIT 1`;
  const result = await db.query(sql, [countryCode, policyType, quoteDate, customerAge, coverageAmount]);
  return result.rows[0] || null;
}

module.exports = { findEffectiveRule };
