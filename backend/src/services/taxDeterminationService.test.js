const { TaxDeterminationService } = require('../src/services/taxDeterminationService');

describe('TaxDeterminationService', () => {
  it('should calculate parity tax against base premium using configured rule', async () => {
    const service = new TaxDeterminationService({
      ruleConfigurationService: {
        getTaxRule: jest.fn().mockResolvedValue({ tax_rule_id: 'TX1', tax_rate: 0.09 })
      }
    });

    const result = await service.calculate({ countryCode: 'ES', policyType: 'TRAVEL' }, { basePremium: 425.00 }, 'LEGACY_PARITY');
    expect(result.taxAmount).toBe(38.25);
    expect(result.taxRate).toBe(0.09);
  });

  it('should calculate Germany HEALTH configured tax using selected rule', async () => {
    const service = new TaxDeterminationService({
      ruleConfigurationService: {
        getTaxRule: jest.fn().mockResolvedValue({ tax_rule_id: 'DE_HEALTH', tax_rate: 0.21 })
      }
    });

    const result = await service.calculate({ countryCode: 'DE', policyType: 'HEALTH' }, { basePremium: 425.00 }, 'TARGET_REDESIGN');
    expect(result.taxAmount).toBe(89.25);
  });
});
