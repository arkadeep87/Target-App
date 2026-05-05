class ConsentAuditService {
  constructor({ consentRepository, ruleConfigurationService }) {
    this.consentRepository = consentRepository;
    this.ruleConfigurationService = ruleConfigurationService;
  }

  async handleQuoteInitiationConsent(request) {
    const policy = await this.ruleConfigurationService.getConsentPolicy(request);
    const consentRecord = await this.consentRepository.insertConsentEvidence({
      quoteId: null,
      customerId: request.customerId,
      consentStatus: request.consentStatus,
      consentCapturedAt: request.consentCapturedAt || null,
      channelId: request.channelId,
      requestId: request.requestId,
      processingOutcome: request.consentStatus === 'CONSENTED' ? 'CONTINUE' : policy.non_consent_outcome,
      auditMessage: request.consentStatus === 'CONSENTED' ? 'Affirmative consent recorded.' : 'Non-consent attempt recorded.'
    });

    if (request.consentStatus !== 'CONSENTED') {
      return {
        stopProcessing: policy.non_consent_outcome === 'REJECT_AFTER_AUDIT',
        businessOutcomeCode: 'CONSENT_REQUIRED',
        businessMessage: 'Consent is required before quote processing can continue.',
        auditEventIds: [String(consentRecord.consent_evidence_id)]
      };
    }

    return {
      stopProcessing: false,
      consentEvidenceId: consentRecord.consent_evidence_id
    };
  }

  async recordConsentAttempt(request) {
    const record = await this.consentRepository.insertConsentEvidence({
      quoteId: null,
      customerId: request.customerId,
      consentStatus: request.consentStatus,
      consentCapturedAt: request.consentCapturedAt || null,
      channelId: request.channelId,
      requestId: request.requestId,
      processingOutcome: request.consentStatus,
      auditMessage: 'Consent attempt recorded.'
    });

    return {
      requestId: request.requestId,
      consentAuditId: String(record.consent_evidence_id),
      status: 'RECORDED',
      businessOutcomeCode: 'CONSENT_ATTEMPT_RECORDED',
      businessMessage: 'Consent attempt recorded successfully.',
      recordedAt: record.created_at
    };
  }
}

module.exports = { ConsentAuditService };
