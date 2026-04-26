const db = require('../db');

async function getTraceByQuoteId(quoteId) {
  const quote = (await db.query('SELECT * FROM quote WHERE quote_id = $1', [quoteId])).rows[0];
  const ruleSelections = (await db.query('SELECT * FROM applied_rule_trace WHERE quote_id = $1 ORDER BY created_at, applied_rule_trace_id', [quoteId])).rows;
  const chargeProvenance = (await db.query('SELECT line_sequence_no, charge_code, source_provenance, source_rule_id, source_rule_version FROM quote_charge WHERE quote_id = $1 ORDER BY line_sequence_no', [quoteId])).rows;
  const auditEvents = (await db.query('SELECT * FROM audit_event WHERE quote_id = $1 ORDER BY created_at', [quoteId])).rows;
  return {
    quoteId,
    validationSequence: ['MANDATORY_VALIDATION', 'SUPPORTED_COUNTRY', 'ELIGIBILITY', 'CONSENT', 'REFERENCE_DATA', 'COVERAGE_VALIDATION'],
    workflowPathUsed: quote.workflow_path_used,
    ruleSelections,
    referenceDataVersions: ruleSelections.map(r => ({ reference_entity_name: r.reference_entity_name, reference_version: r.reference_version })),
    chargeProvenance,
    countrySpecificApplications: ruleSelections.filter(r => r.rule_area === 'COUNTRY_ADJUSTMENT'),
    auditEvents
  };
}

module.exports = { getTraceByQuoteId };
