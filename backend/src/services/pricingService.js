const basePremiumRepository = require('../repositories/basePremiumRepository');
const riskRepository = require('../repositories/riskRepository');
const discountRepository = require('../repositories/discountRepository');
const workflowRepository = require('../repositories/workflowRepository');
const taxRepository = require('../repositories/taxRepository');
const surchargeRepository = require('../repositories/surchargeRepository');
const countryPricingService = require('./countryPricingService');
const explanationService = require('./pricingExplanationService');

function round2(value) {
  return Number(Number(value).toFixed(2));
}

async function calculateQuote(request) {
  const baseRule = await basePremiumRepository.findRule(request.countryCode, request.policyType, request.quoteDate);
  const basePremium = round2((request.coverageAmount / 1000) * Number(baseRule.rate_per_thousand));

  const riskRule = await riskRepository.findRule(request.countryCode, request.policyType, request.customerAge, request.quoteDate);
  const discountRule = await discountRepository.findRule(request.countryCode, request.policyType, request.customerSegment, request.quoteDate);
  const workflowPathUsed = await workflowRepository.resolvePath(request.countryCode, request.policyType, request.requestedWorkflowPath, request.quoteDate);

  const riskFactor = Number(riskRule.risk_factor);
  const discountAmount = round2(basePremium * (Number(discountRule.discount_percent) / 100));
  const premiumAfterCoreRules = round2((basePremium * riskFactor) - discountAmount);

  let taxAmount = 0;
  let taxRule = null;
  if (workflowPathUsed === 'MAIN') {
    taxRule = await taxRepository.findMainWorkflowRule(request.quoteDate);
    taxAmount = round2(basePremium * (Number(taxRule.tax_rate_percent) / 100));
  } else {
    taxRule = await taxRepository.findAltTaxRule(request.countryCode, request.policyType, request.quoteDate);
    taxAmount = round2(basePremium * (Number(taxRule.tax_rate_percent) / 100));
  }

  const surchargeRule = await surchargeRepository.findRule(request.countryCode, request.paymentFrequency, request.quoteDate);
  const paymentSurchargeAmount = surchargeRule ? round2(premiumAfterCoreRules * (Number(surchargeRule.surcharge_percent) / 100)) : 0;

  const countryAdjustment = await countryPricingService.calculateCountryAdjustment({ request, premiumAfterCoreRules, quoteDate: request.quoteDate });
  const countryAdjustmentAmount = round2(countryAdjustment.finalAmount);
  const finalPremium = round2(premiumAfterCoreRules + taxAmount + countryAdjustmentAmount + paymentSurchargeAmount);

  const chargeLines = [];
  chargeLines.push({ lineSequenceNo: 1, chargeCode: 'BASE_PREMIUM', amount: basePremium, sourceProvenance: 'CONFIGURED_RULE_SOURCE' });
  chargeLines.push({ lineSequenceNo: 2, chargeCode: 'COUNTRY_ADJUSTMENT', amount: countryAdjustmentAmount, sourceProvenance: countryAdjustment.sourceProvenance });
  if (workflowPathUsed === 'ALT_TAX') {
    chargeLines.push({ lineSequenceNo: 3, chargeCode: 'TAX', amount: taxAmount, sourceProvenance: 'TAX_RULE_LOOKUP_SOURCE' });
  }

  const pricingExplanationNotes = await explanationService.buildNotes({ request, workflowPathUsed, taxRule, countryAdjustment, paymentSurchargeAmount });

  return {
    basePremium,
    riskFactor,
    discountAmount,
    taxAmount,
    countryAdjustmentAmount,
    paymentSurchargeAmount,
    finalPremium,
    workflowPathUsed,
    pricingBasis: {
      basePremiumRuleVersion: baseRule.version_no,
      riskRuleVersion: riskRule.version_no,
      discountRuleVersion: discountRule.version_no,
      taxRuleVersion: taxRule.version_no
    },
    appliedRuleVersionIds: [baseRule.base_premium_rule_id, riskRule.risk_model_rule_id, discountRule.discount_rule_id, taxRule.tax_rule_id].filter(Boolean),
    chargeLines,
    pricingExplanationNotes
  };
}

module.exports = { calculateQuote };
