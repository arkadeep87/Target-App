class CountryAdjustmentPrecedenceService {
  constructor({ ruleConfigurationService, countryAdjustmentStrategyService }) {
    this.ruleConfigurationService = ruleConfigurationService;
    this.countryAdjustmentStrategyService = countryAdjustmentStrategyService;
  }

  async resolve({ request, pricingMode, premiumAfterCoreRules }) {
    const primary = await this.ruleConfigurationService.getCountryAdjustmentComponents({ request, pricingMode, premiumAfterCoreRules, sourceSystem: 'CONFIG_DB' });
    const primaryCalculated = this.countryAdjustmentStrategyService.compose({ request, premiumAfterCoreRules, components: primary || [], source: 'CONFIG_DB', precedenceLevel: 1 });

    if (Number(primaryCalculated.countryAdjustmentAmount) !== 0) {
      return primaryCalculated;
    }

    const fallback = await this.ruleConfigurationService.getCountryAdjustmentComponents({ request, pricingMode, premiumAfterCoreRules, sourceSystem: 'FALLBACK_APP' });
    return this.countryAdjustmentStrategyService.compose({ request, premiumAfterCoreRules, components: fallback || [], source: 'FALLBACK_APP', precedenceLevel: 2 });
  }
}

module.exports = { CountryAdjustmentPrecedenceService };
