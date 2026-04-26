jest.mock('../../src/repositories/countryAdjustmentRepository', () => ({
  findRules: jest.fn(),
  findFallbackAmount: jest.fn()
}));

const repository = require('../../src/repositories/countryAdjustmentRepository');
const service = require('../../src/services/countryPricingService');

describe('countryPricingService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('uses configured non-zero adjustment in preference to fallback', async () => {
    repository.findRules.mockResolvedValue([{ calculation_method: 'FIXED_AMOUNT', fixed_amount: 22.00 }]);
    repository.findFallbackAmount.mockResolvedValue(10);
    const result = await service.calculateCountryAdjustment({ request: { countryCode: 'IT', policyType: 'FAMILY', paymentFrequency: 'ANNUAL' }, premiumAfterCoreRules: 500, quoteDate: '2026-04-26' });
    expect(result.finalAmount).toBe(22);
    expect(result.sourceProvenance).toBe('CONFIGURED_RULE_SOURCE');
  });

  test('uses fallback when configured amount is zero', async () => {
    repository.findRules.mockResolvedValue([]);
    repository.findFallbackAmount.mockResolvedValue(7.5);
    const result = await service.calculateCountryAdjustment({ request: { countryCode: 'PT', policyType: 'FAMILY', paymentFrequency: 'ANNUAL' }, premiumAfterCoreRules: 500, quoteDate: '2026-04-26' });
    expect(result.finalAmount).toBe(7.5);
    expect(result.sourceProvenance).toBe('CALCULATED_APPLICATION_SOURCE');
  });

  test('calculates percent-based configured rule amount', async () => {
    repository.findRules.mockResolvedValue([{ calculation_method: 'PERCENT_OF_PREMIUM_AFTER_CORE_RULES', rate_percent: 3.2 }]);
    repository.findFallbackAmount.mockResolvedValue(0);
    const result = await service.calculateCountryAdjustment({ request: { countryCode: 'DE', policyType: 'HEALTH', paymentFrequency: 'ANNUAL' }, premiumAfterCoreRules: 500, quoteDate: '2026-04-26' });
    expect(result.finalAmount).toBe(16);
  });
});
