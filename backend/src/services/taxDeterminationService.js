class TaxDeterminationService {
  constructor({ ruleConfigurationService }) {
    this.ruleConfigurationService = ruleConfigurationService;
  }

  async calculate(request, basePremiumResult, pricingMode) {
    const rule = await this.ruleConfigurationService.getTaxRule({ request, pricingMode });
    if (!rule) {
      throw new Error('Tax rule configuration not found.');
    }
    const taxAmount = Number((Number(basePremiumResult.basePremium) * Number(rule.tax_rate)).toFixed(2));
    return {
      taxAmount,
      taxRuleId: rule.tax_rule_id,
      taxRate: Number(rule.tax_rate)
    };
  }
}

module.exports = { TaxDeterminationService };
