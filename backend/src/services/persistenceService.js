const db = require('../db');

async function persistSuccessfulQuote(request, referenceSnapshot, pricingResult) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const quoteInsert = await client.query(
      `INSERT INTO quote (request_id, customer_id, country_code, policy_type, coverage_amount, quote_date, workflow_path_used, base_premium, risk_factor, discount_amount, tax_amount, country_adjustment_amount, payment_surcharge_amount, final_premium, consent_indicator, pricing_basis_reference, status, created_at, completed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,now(),now()) RETURNING quote_id`,
      [request.requestId, request.customerId, request.countryCode, request.policyType, request.coverageAmount, request.quoteDate, pricingResult.workflowPathUsed, pricingResult.basePremium, pricingResult.riskFactor, pricingResult.discountAmount, pricingResult.taxAmount, pricingResult.countryAdjustmentAmount, pricingResult.paymentSurchargeAmount, pricingResult.finalPremium, request.gdprConsent, JSON.stringify(pricingResult.pricingBasis), 'COMPLETED']
    );
    const quoteId = quoteInsert.rows[0].quote_id;

    await client.query(
      `INSERT INTO quote_context (quote_id, customer_age, country_code, policy_type, customer_segment, payment_frequency, coverage_amount, country_adjustment_amount, final_premium, defaulted_segment_flag, defaulted_payment_frequency_flag, defaulted_discount_flag, defaulted_tax_flag, defaulted_risk_factor_flag, defaulted_consent_flag, reference_version_snapshot, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,now())`,
      [quoteId, request.customerAge, request.countryCode, request.policyType, request.customerSegment || 'STANDARD', request.paymentFrequency || 'ANNUAL', request.coverageAmount, pricingResult.countryAdjustmentAmount, pricingResult.finalPremium, !request.customerSegment, !request.paymentFrequency, false, false, false, !request.gdprConsent, JSON.stringify(referenceSnapshot)]
    );

    for (const line of pricingResult.chargeLines) {
      await client.query(
        `INSERT INTO quote_charge (quote_id, line_sequence_no, charge_code, charge_category, amount, currency_code, source_provenance, source_rule_id, source_rule_version, calculation_basis, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())`,
        [quoteId, line.lineSequenceNo, line.chargeCode, line.chargeCode, line.amount, 'EUR', line.sourceProvenance, null, null, null]
      );
    }

    let displaySequenceNo = 1;
    for (const note of pricingResult.pricingExplanationNotes) {
      await client.query(
        `INSERT INTO pricing_explanation (quote_id, display_sequence_no, note_type, note_text, country_code, source_charge_id, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,now())`,
        [quoteId, displaySequenceNo++, 'BUSINESS_NOTE', note, request.countryCode, null]
      );
    }

    await client.query('COMMIT');
    return { quoteId };
  } catch (err) {
    await client.query('ROLLBACK');
    err.code = err.code || 'PERSISTENCE_FAILURE';
    err.category = err.category || 'TECHNICAL';
    err.rejectedStage = 'PERSISTENCE';
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { persistSuccessfulQuote };
