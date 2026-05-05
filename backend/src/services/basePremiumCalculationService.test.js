const { BasePremiumCalculationService } = require('../src/services/basePremiumCalculationService');

describe('BasePremiumCalculationService', () => {
  it('should calculate base premium using configured base rate and round to two decimals', async () => {
    const service = new BasePremiumCalculationService({
      ruleConfigurationService: {
        getBaseRateRule: jest.fn().mockResolvedValue({ base_rate_rule_id: 'BR1', base_rate: 4.25, effective_from: '2026-01-01' })
      }
    });

    const result = await service.calculate({ coverageAmount: 100000 }, 'LEGACY_PARITY');
    expect(result.basePremium).toBe(425.00);
    expect(result.appliedBaseRate).toBe(4.25);
  });
});
