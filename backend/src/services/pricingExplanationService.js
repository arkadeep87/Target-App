async function buildNotes({ request, workflowPathUsed, taxRule, countryAdjustment, paymentSurchargeAmount }) {
  const notes = [];
  notes.push(`Workflow path used: ${workflowPathUsed}.`);
  if (taxRule) {
    notes.push(`Tax was calculated using the approved ${request.countryCode} tax configuration in force for the quote date.`);
  }
  if (countryAdjustment && Number(countryAdjustment.finalAmount) !== 0) {
    notes.push(`Country-specific pricing adjustments were applied for ${request.countryCode}.`);
  }
  if (paymentSurchargeAmount && Number(paymentSurchargeAmount) !== 0) {
    notes.push(`Payment frequency surcharge was applied for ${request.paymentFrequency}.`);
  }
  return notes;
}

module.exports = { buildNotes };
