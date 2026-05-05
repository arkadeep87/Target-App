const { CountryAdjustmentStrategyService } = require('../src/services/countryAdjustmentStrategyService');

describe('CountryAdjustmentStrategyService', () => {
  const service = new CountryAdjustmentStrategyService();

  it('should compose Spain TRAVEL adjustment from percentage and fixed configured components', () => {
    const result = service.compose({
      request: { countryCode: 'ES', policyType: 'TRAVEL' },
      premiumAfterCoreRules: 488.75,
      source: 'CONFIG_DB',
      precedenceLevel: 1,
      components: [
        { country_adjustment_rule_id: 'ES1', adjustment_type: 'PERCENTAGE', percentage_rate: 0.018, component_code: 'BASE_ADJUSTMENT', business_description: 'Spain 1.8% adjustment' },
        { country_adjustment_rule_id: 'ES2', adjustment_type: 'FIXED', fixed_amount: 9.50, component_code: 'TRAVEL_RESERVE', business_description: 'Spain travel reserve fee' }
      ]
    });

    expect(result.countryAdjustmentAmount).toBe(18.30);
    expect(result.chargeLines).toHaveLength(2);
  });

  it('should compose Germany HEALTH base and health uplift as separate components', () => {
    const result = service.compose({
      request: { countryCode: 'DE', policyType: 'HEALTH' },
      premiumAfterCoreRules: 500,
      source: 'CONFIG_DB',
      precedenceLevel: 1,
      components: [
        { country_adjustment_rule_id: 'DE1', adjustment_type: 'PERCENTAGE', percentage_rate: 0.032, component_code: 'BASE_ADJUSTMENT', business_description: 'Germany base adjustment' },
        { country_adjustment_rule_id: 'DE2', adjustment_type: 'PERCENTAGE', percentage_rate: 0.014, component_code: 'HEALTH_UPLIFT', business_description: 'Germany health uplift' }
      ]
    });

    expect(result.countryAdjustmentAmount).toBe(23.00);
    expect(result.chargeLines.map(c => c.chargeSubtype)).toEqual(['DE_BASE_ADJUSTMENT', 'DE_HEALTH_UPLIFT']);
  });

  it('should compose Italy FAMILY relief as negative fixed component', () => {
    const result = service.compose({
      request: { countryCode: 'IT', policyType: 'FAMILY' },
      premiumAfterCoreRules: 500,
      source: 'CONFIG_DB',
      precedenceLevel: 1,
      components: [
        { country_adjustment_rule_id: 'IT1', adjustment_type: 'FIXED', fixed_amount: 22.00, component_code: 'BASE_ADJUSTMENT', business_description: 'Italy base adjustment' },
        { country_adjustment_rule_id: 'IT2', adjustment_type: 'FIXED', fixed_amount: -12.00, component_code: 'FAMILY_RELIEF', business_description: 'Italy family relief' }
      ]
    });

    expect(result.countryAdjustmentAmount).toBe(10.00);
  });
});
