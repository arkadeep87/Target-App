const { ConsentAuditService } = require('../src/services/consentAuditService');

describe('ConsentAuditService', () => {
  it('should continue processing for affirmative consent', async () => {
    const service = new ConsentAuditService({
      consentRepository: { insertConsentEvidence: jest.fn().mockResolvedValue({ consent_evidence_id: 1 }) },
      ruleConfigurationService: { getConsentPolicy: jest.fn().mockResolvedValue({ non_consent_outcome: 'REJECT_AFTER_AUDIT' }) }
    });

    const result = await service.handleQuoteInitiationConsent({
      customerId: 'C1', consentStatus: 'CONSENTED', channelId: 'API', requestId: 'REQ1', consentCapturedAt: '2026-01-01T00:00:00Z'
    });

    expect(result.stopProcessing).toBe(false);
  });

  it('should record non-consent and stop processing when policy requires reject after audit', async () => {
    const service = new ConsentAuditService({
      consentRepository: { insertConsentEvidence: jest.fn().mockResolvedValue({ consent_evidence_id: 2 }) },
      ruleConfigurationService: { getConsentPolicy: jest.fn().mockResolvedValue({ non_consent_outcome: 'REJECT_AFTER_AUDIT' }) }
    });

    const result = await service.handleQuoteInitiationConsent({
      customerId: 'C1', consentStatus: 'DECLINED', channelId: 'API', requestId: 'REQ2'
    });

    expect(result.stopProcessing).toBe(true);
    expect(result.businessOutcomeCode).toBe('CONSENT_REQUIRED');
  });
});
