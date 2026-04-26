const eligibilityRepository = require('../repositories/eligibilityRepository');

async function evaluate(request) {
  const rule = await eligibilityRepository.findEffectiveRule({
    countryCode: request.countryCode,
    policyType: request.policyType,
    customerAge: request.customerAge,
    coverageAmount: request.coverageAmount,
    quoteDate: request.quoteDate
  });
  if (!rule) {
    return { allowed: false, rule: null };
  }
  return { allowed: true, rule };
}

module.exports = { evaluate };
