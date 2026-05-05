const { PremiumSequencingService } = require('../src/services/premiumSequencingService');

describe('PremiumSequencingService', () => {
  it('should calculate premium after core rules using approved sequence', () => {
    const service = new PremiumSequencingService();
    const premiumAfterCoreRules = service.calculatePremiumAfterCoreRules({
      basePremium: 425.00,
      riskFactor: 1.1,
      discountAmount: 17.00,
      taxAmount: 38.25
    });
    expect(premiumAfterCoreRules).toBe(488.75);
  });

  it('should assemble final premium including country adjustment and payment surcharge', () => {
    const service = new PremiumSequencingService();
    const result = service.assembleBreakdown({
      basePremiumResult: { basePremium: 425.00, appliedBaseRate: 4.25, baseRateRuleId: 'BR1' },
      riskResult: { riskFactor: 1.1, riskRuleId: 'RK1' },
      discountResult: { discountAmount: 17.00, discountRuleId: 'DR1' },
      taxResult: { taxAmount: 38.25, taxRate: 0.09, taxRuleId: 'TX1' },
      premiumAfterCoreRules: 488.75,
      countryAdjustmentResult: { countryAdjustmentAmount: 10.00, chargeLines: [], countryAdjustmentRuleIds: ['CA1'] },
      paymentSurchargeResult: { paymentFrequencySurchargeAmount: 7.33, chargeLines: [], paymentSurchargeRuleId: 'PS1' }
    });
    expect(result.finalPremium).toBe(506.08);
  });
});
