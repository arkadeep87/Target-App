class RiskFactorService {
  constructor({ ruleConfigurationService }) {
    this.ruleConfigurationService = ruleConfigurationService;
  }

  async resolve(request, pricingMode) {
    const rule = await this.ruleConfigurationService.getRiskRule({ request, pricingMode });
    if (!rule) {
      throw new Error('Risk rule configuration not found.');
    }
    return {
      riskFactor: Number(rule.risk_factor),
      riskRuleId: rule.risk_rule_id,
      precisionScale: rule.precision_scale
    };
  }
}

module.exports = { RiskFactorService };
