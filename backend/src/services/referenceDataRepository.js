const db = require('../db');

async function getActiveProductReference(countryCode, policyType, quoteDate) {
  const sql = `SELECT * FROM product_reference WHERE country_code = $1 AND policy_type = $2 AND active_flag = true AND effective_from <= $3 AND (effective_to IS NULL OR effective_to >= $3) ORDER BY version_no DESC LIMIT 1`;
  const result = await db.query(sql, [countryCode, policyType, quoteDate]);
  if (!result.rows[0]) throwConfigError('Inactive or missing product reference data.');
  return result.rows[0];
}

async function getActivePaymentScheduleReference(countryCode, paymentFrequency, quoteDate) {
  const sql = `SELECT * FROM payment_schedule_reference WHERE country_code = $1 AND payment_frequency = $2 AND active_flag = true AND effective_from <= $3 AND (effective_to IS NULL OR effective_to >= $3) ORDER BY version_no DESC LIMIT 1`;
  const result = await db.query(sql, [countryCode, paymentFrequency, quoteDate]);
  if (!result.rows[0]) throwConfigError('Inactive or missing payment schedule reference data.');
  return result.rows[0];
}

async function getUnderwritingStatusRule(countryCode, quoteDate) {
  const sql = `SELECT * FROM underwriting_status_rule WHERE country_code = $1 AND active_flag = true AND effective_from <= $2 AND (effective_to IS NULL OR effective_to >= $2) ORDER BY version_no DESC LIMIT 1`;
  const result = await db.query(sql, [countryCode, quoteDate]);
  if (!result.rows[0]) throwConfigError('Missing underwriting status rule.');
  return result.rows[0];
}

async function getSupportedCountries(quoteDate) {
  const result = await db.query(`SELECT DISTINCT country_code FROM underwriting_status_rule WHERE active_flag = true AND effective_from <= $1 AND (effective_to IS NULL OR effective_to >= $1) ORDER BY country_code`, [quoteDate || new Date().toISOString().slice(0, 10)]);
  return result.rows.map(r => ({ code: r.country_code, available: true }));
}

async function getAvailablePolicyTypes(countryCode, quoteDate) {
  const result = await db.query(`SELECT DISTINCT policy_type FROM product_reference WHERE country_code = $1 AND active_flag = true AND effective_from <= $2 AND (effective_to IS NULL OR effective_to >= $2) ORDER BY policy_type`, [countryCode, quoteDate]);
  return result.rows.map(r => r.policy_type);
}

async function getAvailablePaymentFrequencies(countryCode, quoteDate) {
  const result = await db.query(`SELECT DISTINCT payment_frequency FROM payment_schedule_reference WHERE country_code = $1 AND active_flag = true AND effective_from <= $2 AND (effective_to IS NULL OR effective_to >= $2) ORDER BY payment_frequency`, [countryCode, quoteDate]);
  return result.rows.map(r => r.payment_frequency);
}

async function getCountryGuidanceNotices(countryCode) {
  return [`Country-specific pricing guidance is active for ${countryCode}.`];
}

async function isConsentRequired(countryCode) {
  const requiredCountries = ['DE', 'IT', 'ES', 'PT', 'CH', 'GB'];
  return requiredCountries.includes(countryCode);
}

async function getActiveReferenceVersions(countryCode, quoteDate) {
  const result = await db.query(`SELECT 'product_reference' as reference_name, version_no FROM product_reference WHERE country_code = $1 AND active_flag = true AND effective_from <= $2 AND (effective_to IS NULL OR effective_to >= $2)
    UNION ALL
    SELECT 'payment_schedule_reference' as reference_name, version_no FROM payment_schedule_reference WHERE country_code = $1 AND active_flag = true AND effective_from <= $2 AND (effective_to IS NULL OR effective_to >= $2)`, [countryCode, quoteDate]);
  return result.rows;
}

function throwConfigError(message) {
  const err = new Error(message);
  err.code = 'REFERENCE_DATA_INVALID';
  err.category = 'CONFIGURATION';
  err.rejectedStage = 'REFERENCE_DATA';
  throw err;
}

module.exports = {
  getActiveProductReference,
  getActivePaymentScheduleReference,
  getUnderwritingStatusRule,
  getSupportedCountries,
  getAvailablePolicyTypes,
  getAvailablePaymentFrequencies,
  getCountryGuidanceNotices,
  isConsentRequired,
  getActiveReferenceVersions
};
