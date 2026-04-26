const countryAdjustmentRepository = require('../repositories/countryAdjustmentRepository');

function round2(value) {
  return Number(Number(value).toFixed(2));
}

async function calculateCountryAdjustment({ request, premiumAfterCoreRules, quoteDate }) {
  const configuredRules = await countryAdjustmentRepository.findRules(request.countryCode, request.policyType, request.paymentFrequency, quoteDate);
  let configuredAmount = 0;
  for (const rule of configuredRules) {
    if (rule.calculation_method === 'PERCENT_OF_PREMIUM_AFTER_CORE_RULES') {
      configuredAmount += round2(premiumAfterCoreRules * (Number(rule.rate_percent) / 100));
    } else if (rule.calculation_method === 'FIXED_AMOUNT') {
      configuredAmount += Number(rule.fixed_amount);
    }
  }
  const fallbackAmount = await countryAdjustmentRepository.findFallbackAmount(request.countryCode, request.policyType, request.paymentFrequency, premiumAfterCoreRules, quoteDate);
  const finalAmount = configuredAmount !== 0 ? configuredAmount : (fallbackAmount || 0);
  const sourceProvenance = configuredAmount !== 0 ? 'CONFIGURED_RULE_SOURCE' : 'CALCULATED_APPLICATION_SOURCE';
  return {
    finalAmount,
    configuredAmount,
    fallbackAmount: fallbackAmount || 0,
    sourceProvenance,
    appliedRules: configuredRules
  };
}

module.exports = { calculateCountryAdjustment };
