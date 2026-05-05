class PremiumSequencingService {
  calculatePremiumAfterCoreRules({ basePremium, riskFactor, discountAmount, taxAmount }) {
    return Number(((Number(basePremium) * Number(riskFactor)) - Number(discountAmount) + Number(taxAmount)).toFixed(2));
  }

  assembleBreakdown({ basePremiumResult, riskResult, discountResult, taxResult, premiumAfterCoreRules, countryAdjustmentResult, paymentSurchargeResult }) {
    const finalPremium = Number((Number(premiumAfterCoreRules) + Number(countryAdjustmentResult.countryAdjustmentAmount) + Number(paymentSurchargeResult.paymentFrequencySurchargeAmount)).toFixed(2));

    const chargeLines = [
      {
        sequenceNumber: 1,
        chargeType: 'BASE',
        chargeSubtype: 'BASE_PREMIUM',
        amount: basePremiumResult.basePremium,
        calculationBasis: 'COVERAGE_AMOUNT',
        rateOrFixedValue: basePremiumResult.appliedBaseRate,
        sourceRuleFamily: 'BASE_RATE',
        sourceRuleId: basePremiumResult.baseRateRuleId,
        businessDescription: 'Base premium'
      },
      {
        sequenceNumber: 2,
        chargeType: 'DISCOUNT',
        chargeSubtype: 'CORE_DISCOUNT',
        amount: discountResult.discountAmount,
        calculationBasis: 'BASE_PREMIUM',
        sourceRuleFamily: 'DISCOUNT',
        sourceRuleId: discountResult.discountRuleId,
        businessDescription: 'Discount amount'
      },
      {
        sequenceNumber: 3,
        chargeType: 'TAX',
        chargeSubtype: 'CORE_TAX',
        amount: taxResult.taxAmount,
        calculationBasis: 'BASE_PREMIUM',
        rateOrFixedValue: taxResult.taxRate,
        sourceRuleFamily: 'TAX',
        sourceRuleId: taxResult.taxRuleId,
        businessDescription: 'Tax amount'
      },
      ...countryAdjustmentResult.chargeLines,
      ...paymentSurchargeResult.chargeLines
    ];

    return {
      basePremium: basePremiumResult.basePremium,
      appliedBaseRate: basePremiumResult.appliedBaseRate,
      riskFactor: riskResult.riskFactor,
      discountAmount: discountResult.discountAmount,
      taxAmount: taxResult.taxAmount,
      premiumAfterCoreRules,
      countryAdjustmentAmount: countryAdjustmentResult.countryAdjustmentAmount,
      paymentFrequencySurchargeAmount: paymentSurchargeResult.paymentFrequencySurchargeAmount,
      finalPremium,
      chargeLines
    };
  }
}

module.exports = { PremiumSequencingService };
