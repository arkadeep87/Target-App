class PaymentFrequencySurchargeService {
  constructor({ ruleConfigurationService }) {
    this.ruleConfigurationService = ruleConfigurationService;
  }

  async calculate({ request, pricingMode, premiumAfterCoreRules }) {
    const rule = await this.ruleConfigurationService.getPaymentSurchargeRule({ request, pricingMode });
    if (!rule) {
      return { paymentFrequencySurchargeAmount: 0, paymentSurchargeRuleId: null, chargeLines: [] };
    }

    const rate = Number(rule.surcharge_rate || 0);
    const amount = Number((Number(premiumAfterCoreRules) * rate).toFixed(2));

    return {
      paymentFrequencySurchargeAmount: amount,
      paymentSurchargeRuleId: rule.payment_surcharge_rule_id,
      chargeLines: amount === 0 ? [] : [{
        sequenceNumber: 7,
        chargeType: 'PAYMENT_SURCHARGE',
        chargeSubtype: `PAYMENT_${request.paymentFrequency}`,
        amount,
        calculationBasis: 'PREMIUM_AFTER_CORE_RULES',
        rateOrFixedValue: rate,
        sourceRuleFamily: 'PAYMENT_SURCHARGE',
        sourceRuleId: rule.payment_surcharge_rule_id,
        businessDescription: `${request.paymentFrequency} payment surcharge`
      }]
    };
  }
}

module.exports = { PaymentFrequencySurchargeService };
