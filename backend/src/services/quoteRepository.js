const db = require('../db');

async function getQuoteById(quoteId) {
  const quoteHeader = (await db.query('SELECT * FROM quote WHERE quote_id = $1', [quoteId])).rows[0];
  const quoteContext = (await db.query('SELECT * FROM quote_context WHERE quote_id = $1', [quoteId])).rows[0];
  const chargeLines = (await db.query('SELECT * FROM quote_charge WHERE quote_id = $1 ORDER BY line_sequence_no', [quoteId])).rows;
  const underwritingCase = (await db.query('SELECT * FROM underwriting_case WHERE quote_id = $1', [quoteId])).rows[0] || null;
  const auditEvents = (await db.query('SELECT * FROM audit_event WHERE quote_id = $1 OR (quote_id IS NULL AND request_id = $2)', [quoteId, quoteHeader.request_id])).rows;
  const pricingExplanationNotes = (await db.query('SELECT * FROM pricing_explanation WHERE quote_id = $1 ORDER BY display_sequence_no', [quoteId])).rows;
  const appliedRuleVersionIds = [];
  return { quoteId, quoteHeader, quoteContext, chargeLines, underwritingCase, auditEvents, pricingExplanationNotes, appliedRuleVersionIds, workflowPathUsed: quoteHeader.workflow_path_used };
}

module.exports = { getQuoteById };
