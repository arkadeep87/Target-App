class QuoteOrchestrationService {
  constructor({
    requestValidator,
    supportedCountryValidator,
    referenceDataValidationService,
    coverageLimitValidationService,
    eligibilityDecisionService,
    consentAuditService,
    basePremiumCalculationService,
    riskFactorService,
    discountCalculationService,
    taxDeterminationService,
    countryAdjustmentPrecedenceService,
    paymentFrequencySurchargeService,
    premiumSequencingService,
    underwritingRoutingService,
    quotePersistenceService,
    auditService,
    ruleConfigurationService,
    db
  }) {
    Object.assign(this, {
      requestValidator,
      supportedCountryValidator,
      referenceDataValidationService,
      coverageLimitValidationService,
      eligibilityDecisionService,
      consentAuditService,
      basePremiumCalculationService,
      riskFactorService,
      discountCalculationService,
      taxDeterminationService,
      countryAdjustmentPrecedenceService,
      paymentFrequencySurchargeService,
      premiumSequencingService,
      underwritingRoutingService,
      quotePersistenceService,
      auditService,
      ruleConfigurationService,
      db
    });
  }

  async generateQuote(request) {
    this.requestValidator.validate(request);
    await this.supportedCountryValidator.validate(request.countryCode);

    const consentResult = await this.consentAuditService.handleQuoteInitiationConsent(request);
    if (consentResult.stopProcessing) {
      await this.auditService.recordValidationFailure({
        quoteId: null,
        requestId: request.requestId,
        customerId: request.customerId,
        eventType: 'CONSENT_REJECTED',
        businessMessage: consentResult.businessMessage,
        reasonCode: consentResult.businessOutcomeCode,
        channelId: request.channelId
      });
      return {
        requestId: request.requestId,
        status: 'REJECTED',
        businessOutcomeCode: consentResult.businessOutcomeCode,
        businessMessage: consentResult.businessMessage,
        auditEventIds: consentResult.auditEventIds || []
      };
    }

    await this.referenceDataValidationService.validate(request);
    await this.coverageLimitValidationService.validate(request);
    const eligibility = await this.eligibilityDecisionService.evaluate(request);
    if (!eligibility.accepted) {
      await this.auditService.recordValidationFailure({
        quoteId: null,
        requestId: request.requestId,
        customerId: request.customerId,
        eventType: 'ELIGIBILITY_REJECTED',
        businessMessage: eligibility.reasonText,
        reasonCode: eligibility.reasonCode,
        channelId: request.channelId
      });
      return {
        requestId: request.requestId,
        status: 'REJECTED',
        businessOutcomeCode: eligibility.reasonCode,
        businessMessage: eligibility.reasonText
      };
    }

    const pricingMode = await this.ruleConfigurationService.getOperatingMode(request);
    const basePremiumResult = await this.basePremiumCalculationService.calculate(request, pricingMode);
    const riskResult = await this.riskFactorService.resolve(request, pricingMode);
    const discountResult = await this.discountCalculationService.calculate(request, basePremiumResult, pricingMode);
    const taxResult = await this.taxDeterminationService.calculate(request, basePremiumResult, pricingMode);
    const premiumAfterCoreRules = this.premiumSequencingService.calculatePremiumAfterCoreRules({
      basePremium: basePremiumResult.basePremium,
      riskFactor: riskResult.riskFactor,
      discountAmount: discountResult.discountAmount,
      taxAmount: taxResult.taxAmount
    });
    const countryAdjustmentResult = await this.countryAdjustmentPrecedenceService.resolve({ request, pricingMode, premiumAfterCoreRules });
    const paymentSurchargeResult = await this.paymentFrequencySurchargeService.calculate({ request, pricingMode, premiumAfterCoreRules });
    const pricingBreakdown = this.premiumSequencingService.assembleBreakdown({
      basePremiumResult,
      riskResult,
      discountResult,
      taxResult,
      premiumAfterCoreRules,
      countryAdjustmentResult,
      paymentSurchargeResult
    });

    const route = await this.underwritingRoutingService.resolve(request, pricingMode);

    return this.db.withTransaction(async (client) => {
      const persisted = await this.quotePersistenceService.persistSuccessfulQuote({
        client,
        request,
        pricingMode,
        pricingBreakdown,
        eligibility,
        basePremiumResult,
        riskResult,
        discountResult,
        taxResult,
        countryAdjustmentResult,
        paymentSurchargeResult,
        route
      });

      const underwritingCase = await this.underwritingRoutingService.createCase({
        client,
        request,
        quoteId: persisted.quoteId,
        route
      });

      const auditEventIds = await this.auditService.recordQuoteSuccess({
        client,
        quoteId: persisted.quoteId,
        request,
        pricingBreakdown,
        underwritingCaseId: underwritingCase.underwritingCaseId
      });

      return {
        requestId: request.requestId,
        quoteId: persisted.quoteId,
        status: 'SUCCESS',
        businessOutcomeCode: 'QUOTE_CREATED',
        businessMessage: 'Quote created successfully.',
        countryCode: request.countryCode,
        policyType: request.policyType,
        coverageAmount: request.coverageAmount,
        paymentFrequency: request.paymentFrequency,
        pricingBreakdown,
        underwritingCaseId: underwritingCase.underwritingCaseId,
        underwritingStatus: underwritingCase.status,
        ruleTraceId: persisted.ruleTraceId,
        auditEventIds,
        createdAt: persisted.createdAt
      };
    });
  }
}

module.exports = { QuoteOrchestrationService };
