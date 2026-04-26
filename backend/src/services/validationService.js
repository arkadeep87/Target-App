const eligibilityService = require('./eligibilityService');

const SUPPORTED_COUNTRIES = ['DE', 'IT', 'ES', 'PT', 'CH', 'GB'];

async function validateMandatoryRequest(request) {
  const requiredFields = ['requestId', 'customerId', 'customerAge', 'countryCode', 'policyType', 'coverageAmount', 'paymentFrequency', 'customerSegment', 'gdprConsent', 'quoteDate', 'idempotencyKey'];
  const fieldErrors = [];
  requiredFields.forEach((field) => {
    if (request[field] === undefined || request[field] === null || request[field] === '') {
      fieldErrors.push({ field, message: 'Field is required' });
    }
  });
  if (fieldErrors.length) {
    const err = new Error('Mandatory quote data is missing or invalid.');
    err.code = 'MANDATORY_VALIDATION_FAILED';
    err.category = 'VALIDATION';
    err.fieldErrors = fieldErrors;
    err.rejectedStage = 'VALIDATION';
    throw err;
  }
}

async function validateSupportedCountry(countryCode) {
  if (!SUPPORTED_COUNTRIES.includes(countryCode)) {
    const err = new Error('Unsupported country for quote generation.');
    err.code = 'UNSUPPORTED_COUNTRY';
    err.category = 'VALIDATION';
    err.rejectedStage = 'VALIDATION';
    throw err;
  }
}

async function validateEligibility(request, referenceSnapshot) {
  const eligibilityResult = await eligibilityService.evaluate(request, referenceSnapshot);
  if (!eligibilityResult.allowed) {
    const err = new Error('Quote request failed eligibility validation.');
    err.code = 'ELIGIBILITY_FAILED';
    err.category = 'BUSINESS';
    err.rejectedStage = 'ELIGIBILITY';
    throw err;
  }
}

async function validateCoverageBounds(request, referenceSnapshot) {
  const product = referenceSnapshot.productReference;
  if (request.coverageAmount < product.min_coverage_amount) {
    const err = new Error('Coverage amount is below the approved minimum.');
    err.code = 'COVERAGE_BELOW_MINIMUM';
    err.category = 'VALIDATION';
    err.rejectedStage = 'COVERAGE_VALIDATION';
    throw err;
  }
  if (request.coverageAmount > product.max_coverage_amount) {
    const err = new Error('Coverage amount is above the approved maximum.');
    err.code = 'COVERAGE_ABOVE_MAXIMUM';
    err.category = 'VALIDATION';
    err.rejectedStage = 'COVERAGE_VALIDATION';
    throw err;
  }
}

module.exports = { validateMandatoryRequest, validateSupportedCountry, validateEligibility, validateCoverageBounds };
