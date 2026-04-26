const db = require('../db');

async function findMainWorkflowRule(quoteDate) {
  const sql = `SELECT * FROM tax_rule WHERE workflow_path = 'MAIN' AND active_flag = true AND effective_from <= $1 AND (effective_to IS NULL OR effective_to >= $1) ORDER BY priority_order ASC, version_no DESC LIMIT 1`;
  const result = await db.query(sql, [quoteDate]);
  if (!result.rows[0]) throw new Error('Main workflow tax rule resolution failed.');
  return result.rows[0];
}

async function findAltTaxRule(countryCode, policyType, quoteDate) {
  const sql = `SELECT * FROM tax_rule
    WHERE workflow_path = 'ALT_TAX'
      AND country_code = $1
      AND active_flag = true
      AND effective_from <= $3
      AND (effective_to IS NULL OR effective_to >= $3)
      AND (policy_type = $2 OR default_flag = true)
    ORDER BY CASE WHEN policy_type = $2 THEN 0 ELSE 1 END, priority_order ASC, version_no DESC
    LIMIT 1`;
  const result = await db.query(sql, [countryCode, policyType, quoteDate]);
  if (!result.rows[0]) throw new Error('Tax rule-driven resolution failed.');
  return result.rows[0];
}

module.exports = { findMainWorkflowRule, findAltTaxRule };
