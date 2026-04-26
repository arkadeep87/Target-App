const validationService = require('./validationService');
const consentService = require('./consentService');
const referenceDataService = require('./referenceDataService');
const pricingService = require('./pricingService');
const persistenceService = require('./persistenceService');
const underwritingService = require('./underwritingService');
const auditService = require('./auditService');
const idempotencyRepository = require('../repositories/idempotencyRepository');

async function generateQuote(request) {
  const existing = await idempotencyRepository.findByKey(request.idempotencyKey);
  if (existing) {
    return existing.response_payload;
  }

  await validationService.validateMandatoryRequest(request);
  await validationService.validateSupportedCountry(request.countryCode);
  const referenceSnapshot = await referenceDataService.resolveReferenceSnapshot(request);
  await validationService.validateEligibility(request, referenceSnapshot);
  await consentService.processConsent(request, referenceSnapshot);
  await validationService.validateCoverageBounds(request, referenceSnapshot);

  const pricingResult = await pricingService.calculateQuote(request, referenceSnapshot);
  const persisted = await persistenceService.persistSuccessfulQuote(request, referenceSnapshot, pricingResult);
  const underwriting = await underwritingService.createUnderwritingCase(persisted.quoteId, request, referenceSnapshot);
  await auditService.recordQuoteCompletion(persisted.quoteId, request);

  const response = {
    quoteId: persisted.quoteId,
    status: 'SUCCESS',
    countryCode: request.countryCode,
    policyType: request.policyType,
    coverageAmount: request.coverageAmount,
    basePremium: pricingResult.basePremium,
    riskFactor: pricingResult.riskFactor,
    discountAmount: pricingResult.discountAmount,
    taxAmount: pricingResult.taxAmount,
    countryAdjustmentAmount: pricingResult.countryAdjustmentAmount,
    paymentSurchargeAmount: pricingResult.paymentSurchargeAmount,
    finalPremium: pricingResult.finalPremium,
    underwritingCaseId: underwriting.underwriting_case_id,
    underwritingStatus: underwriting.case_status,
    workflowPathUsed: pricingResult.workflowPathUsed,
    pricingBasis: pricingResult.pricingBasis,
    appliedRuleVersionIds: pricingResult.appliedRuleVersionIds,
    chargeLines: pricingResult.chargeLines,
    pricingExplanationNotes: pricingResult.pricingExplanationNotes,
    auditMessages: ['Quote completed successfully'],
    processingTimestamp: new Date().toISOString()
  };

  await idempotencyRepository.save(request.idempotencyKey, request.requestId, response);
  return response;
}

module.exports = { generateQuote };
