class BasePremiumCalculationService {
  constructor({ ruleConfigurationService }) {
    this.ruleConfigurationService = ruleConfigurationService;
  }

  async calculate(request, pricingMode) {
    const rule = await this.ruleConfigurationService.getBaseRateRule({ request, pricingMode });
    if (!rule) {
      throw new Error('Base rate configuration not found.');
    }
    const basePremium = Number(((Number(request.coverageAmount) / 1000) * Number(rule.base_rate)).toFixed(2));
    return {
      basePremium,
      appliedBaseRate: Number(rule.base_rate),
      baseRateRuleId: rule.base_rate_rule_id,
      effectiveFrom: rule.effective_from
    };
  }
}

module.exports = { BasePremiumCalculationService };
