class QuotePersistenceService {
  constructor({ quoteRepository, ruleTraceRepository }) {
    this.quoteRepository = quoteRepository;
    this.ruleTraceRepository = ruleTraceRepository;
  }

  async persistSuccessfulQuote({ client, request, pricingMode, pricingBreakdown, eligibility, basePremiumResult, riskResult, discountResult, taxResult, countryAdjustmentResult, paymentSurchargeResult, route }) {
    const quoteId = await this.quoteRepository.nextQuoteId(client);
    const ruleTrace = await this.ruleTraceRepository.insertRuleTrace(client, {
      quoteId,
      pricingMode,
      baseRateRuleId: basePremiumResult.baseRateRuleId,
      riskRuleId: riskResult.riskRuleId,
      discountRuleId: discountResult.discountRuleId,
      taxRuleId: taxResult.taxRuleId,
      countryAdjustmentRuleIds: countryAdjustmentResult.countryAdjustmentRuleIds,
      paymentSurchargeRuleId: paymentSurchargeResult.paymentSurchargeRuleId,
      underwritingRouteRuleId: route.underwriting_route_rule_id,
      configurationSnapshotJson: JSON.stringify({ pricingMode })
    });

    const created = await this.quoteRepository.insertQuoteHeader(client, {
      quoteId,
      requestId: request.requestId,
      customerId: request.customerId,
      countryCode: request.countryCode,
      policyType: request.policyType,
      coverageAmount: request.coverageAmount,
      paymentFrequency: request.paymentFrequency,
      customerSegment: request.customerSegment,
      consentStatus: request.consentStatus,
      status: 'SUCCESS',
      basePremium: pricingBreakdown.basePremium,
      riskFactor: pricingBreakdown.riskFactor,
      discountAmount: pricingBreakdown.discountAmount,
      taxAmount: pricingBreakdown.taxAmount,
      premiumAfterCoreRules: pricingBreakdown.premiumAfterCoreRules,
      countryAdjustmentAmount: pricingBreakdown.countryAdjustmentAmount,
      paymentFrequencySurchargeAmount: pricingBreakdown.paymentFrequencySurchargeAmount,
      finalPremium: pricingBreakdown.finalPremium,
      pricingMode,
      ruleTraceId: ruleTrace.rule_trace_id
    });

    await this.quoteRepository.insertQuoteContext(client, {
      quoteId,
      customerAge: request.customerAge,
      countryCode: request.countryCode,
      policyType: request.policyType,
      coverageAmount: request.coverageAmount,
      paymentFrequency: request.paymentFrequency,
      customerSegment: request.customerSegment,
      channelId: request.channelId,
      eligibilityOutcome: eligibility.reasonCode,
      eligibilityReasonCode: eligibility.reasonCode,
      eligibilityReasonText: eligibility.reasonText,
      countryAdjustmentSource: countryAdjustmentResult.source,
      taxRuleId: taxResult.taxRuleId,
      discountRuleId: discountResult.discountRuleId,
      riskRuleId: riskResult.riskRuleId,
      baseRateRuleId: basePremiumResult.baseRateRuleId,
      underwritingRouteRuleId: route.underwriting_route_rule_id
    });

    await this.quoteRepository.insertChargeLines(client, quoteId, pricingBreakdown.chargeLines);

    return {
      quoteId,
      ruleTraceId: ruleTrace.rule_trace_id,
      createdAt: created.created_at
    };
  }
}

module.exports = { QuotePersistenceService };
