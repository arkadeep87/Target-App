const db = require('../db');

async function create(input) {
  const result = await db.query(
    `INSERT INTO underwriting_case (quote_id, customer_id, country_code, case_status, status_mapping_version, handoff_timestamp, created_at)
     VALUES ($1,$2,$3,$4,$5,now(),now()) RETURNING underwriting_case_id, case_status`,
    [input.quoteId, input.customerId, input.countryCode, input.caseStatus, input.statusMappingVersion]
  );
  return { underwriting_case_id: result.rows[0].underwriting_case_id, case_status: result.rows[0].case_status };
}

module.exports = { create };
