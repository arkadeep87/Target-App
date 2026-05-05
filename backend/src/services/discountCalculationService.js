class DiscountCalculationService {
  constructor({ ruleConfigurationService }) {
    this.ruleConfigurationService = ruleConfigurationService;
  }

  async calculate(request, basePremiumResult, pricingMode) {
    const rule = await this.ruleConfigurationService.getDiscountRule({ request, pricingMode });
    if (!rule) {
      throw new Error('Discount rule configuration not found.');
    }

    let discountAmount = 0;
    if (rule.discount_type === 'BASE_PREMIUM_PERCENTAGE') {
      discountAmount = Number((Number(basePremiumResult.basePremium) * Number(rule.discount_rate)).toFixed(2));
    } else if (rule.discount_type === 'FIXED_AMOUNT') {
      discountAmount = Number(Number(rule.fixed_amount).toFixed(2));
    }

    return {
      discountAmount,
      discountRuleId: rule.discount_rule_id
    };
  }
}

module.exports = { DiscountCalculationService };
