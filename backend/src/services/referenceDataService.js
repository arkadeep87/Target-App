const referenceDataRepository = require('../repositories/referenceDataRepository');

async function resolveReferenceSnapshot(request) {
  const productReference = await referenceDataRepository.getActiveProductReference(request.countryCode, request.policyType, request.quoteDate);
  const paymentScheduleReference = await referenceDataRepository.getActivePaymentScheduleReference(request.countryCode, request.paymentFrequency, request.quoteDate);
  const underwritingStatusRule = await referenceDataRepository.getUnderwritingStatusRule(request.countryCode, request.quoteDate);
  return {
    productReference,
    paymentScheduleReference,
    underwritingStatusRule
  };
}

async function getSupportedReferenceData(countryCode, quoteDate) {
  const supportedCountries = await referenceDataRepository.getSupportedCountries(quoteDate);
  const availablePolicyTypes = countryCode ? await referenceDataRepository.getAvailablePolicyTypes(countryCode, quoteDate) : [];
  const availablePaymentFrequencies = countryCode ? await referenceDataRepository.getAvailablePaymentFrequencies(countryCode, quoteDate) : [];
  const countryGuidanceNotices = countryCode ? await referenceDataRepository.getCountryGuidanceNotices(countryCode, quoteDate) : [];
  const consentRequired = countryCode ? await referenceDataRepository.isConsentRequired(countryCode, quoteDate) : false;
  const activeReferenceVersions = countryCode ? await referenceDataRepository.getActiveReferenceVersions(countryCode, quoteDate) : [];
  return { supportedCountries, availablePolicyTypes, availablePaymentFrequencies, countryGuidanceNotices, consentRequired, activeReferenceVersions };
}

module.exports = { resolveReferenceSnapshot, getSupportedReferenceData };
