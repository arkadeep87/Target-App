const { QuoteOrchestrationService } = require('../src/services/quoteOrchestrationService');

describe('QuoteOrchestrationService', () => {
  it('should reject before pricing when eligibility fails', async () => {
    const service = new QuoteOrchestrationService({
      requestValidator: { validate: jest.fn() },
      supportedCountryValidator: { validate: jest.fn().mockResolvedValue() },
      referenceDataValidationService: { validate: jest.fn().mockResolvedValue() },
      coverageLimitValidationService: { validate: jest.fn().mockResolvedValue() },
      eligibilityDecisionService: { evaluate: jest.fn().mockResolvedValue({ accepted: false, reasonCode: 'ELIGIBILITY_REJECTED', reasonText: 'Rejected' }) },
      consentAuditService: { handleQuoteInitiationConsent: jest.fn().mockResolvedValue({ stopProcessing: false }) },
      auditService: { recordValidationFailure: jest.fn().mockResolvedValue() }
    });

    const response = await service.generateQuote({ customerId: 'C1', customerAge: 17, countryCode: 'ES', policyType: 'TRAVEL', coverageAmount: 100000, paymentFrequency: 'ANNUAL', customerSegment: 'STANDARD', consentStatus: 'CONSENTED', requestId: 'REQ1', channelId: 'API' });
    expect(response.status).toBe('REJECTED');
    expect(response.businessOutcomeCode).toBe('ELIGIBILITY_REJECTED');
  });

  it('should stop processing after non-consent audit when policy rejects', async () => {
    const service = new QuoteOrchestrationService({
      requestValidator: { validate: jest.fn() },
      supportedCountryValidator: { validate: jest.fn().mockResolvedValue() },
      consentAuditService: { handleQuoteInitiationConsent: jest.fn().mockResolvedValue({ stopProcessing: true, businessOutcomeCode: 'CONSENT_REQUIRED', businessMessage: 'Consent is required.', auditEventIds: ['1'] }) },
      auditService: { recordValidationFailure: jest.fn().mockResolvedValue() }
    });

    const response = await service.generateQuote({ customerId: 'C1', customerAge: 30, countryCode: 'ES', policyType: 'TRAVEL', coverageAmount: 100000, paymentFrequency: 'ANNUAL', customerSegment: 'STANDARD', consentStatus: 'DECLINED', requestId: 'REQ2', channelId: 'API' });
    expect(response.status).toBe('REJECTED');
    expect(response.businessOutcomeCode).toBe('CONSENT_REQUIRED');
  });
});
