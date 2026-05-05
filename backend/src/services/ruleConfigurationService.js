class RuleConfigurationService {
  constructor({ ruleConfigurationRepository }) {
    this.ruleConfigurationRepository = ruleConfigurationRepository;
  }

  async getOperatingMode(request) {
    return this.ruleConfigurationRepository.getOperatingMode(request) || 'LEGACY_PARITY';
  }

  async getBaseRateRule({ request, pricingMode }) {
    return this.ruleConfigurationRepository.getBaseRateRule({ request, pricingMode });
  }

  async getRiskRule({ request, pricingMode }) {
    return this.ruleConfigurationRepository.getRiskRule({ request, pricingMode });
  }

  async getDiscountRule({ request, pricingMode }) {
    return this.ruleConfigurationRepository.getDiscountRule({ request, pricingMode });
  }

  async getTaxRule({ request, pricingMode }) {
    return this.ruleConfigurationRepository.getTaxRule({ request, pricingMode });
  }

  async getEligibilityRule(request) {
    return this.ruleConfigurationRepository.getEligibilityRule(request);
  }

  async getCountryAdjustmentComponents({ request, pricingMode, sourceSystem }) {
    return this.ruleConfigurationRepository.getCountryAdjustmentComponents({ request, pricingMode, sourceSystem });
  }

  async getPaymentSurchargeRule({ request, pricingMode }) {
    return this.ruleConfigurationRepository.getPaymentSurchargeRule({ request, pricingMode });
  }

  async getUnderwritingRoute({ request, pricingMode }) {
    return this.ruleConfigurationRepository.getUnderwritingRoute({ request, pricingMode });
  }

  async getConsentPolicy(request) {
    return this.ruleConfigurationRepository.getConsentPolicy(request);
  }
}

module.exports = { RuleConfigurationService };
