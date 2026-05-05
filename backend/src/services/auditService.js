class AuditService {
  constructor({ auditRepository }) {
    this.auditRepository = auditRepository;
  }

  async recordValidationFailure(event) {
    await this.auditRepository.insertAuditEvent(event);
  }

  async recordQuoteSuccess({ client, quoteId, request, pricingBreakdown, underwritingCaseId }) {
    const ids = [];
    ids.push(await this.auditRepository.insertAuditEvent({
      client,
      quoteId,
      requestId: request.requestId,
      customerId: request.customerId,
      eventType: 'QUOTE_CREATED',
      businessMessage: 'Quote created successfully.',
      reasonCode: 'QUOTE_CREATED',
      severity: 'INFO',
      payloadReference: JSON.stringify({ finalPremium: pricingBreakdown.finalPremium }),
      actorType: 'SYSTEM',
      channelId: request.channelId
    }));
    ids.push(await this.auditRepository.insertAuditEvent({
      client,
      quoteId,
      requestId: request.requestId,
      customerId: request.customerId,
      eventType: 'UNDERWRITING_CREATED',
      businessMessage: 'Underwriting case created successfully.',
      reasonCode: 'UNDERWRITING_CREATED',
      severity: 'INFO',
      payloadReference: JSON.stringify({ underwritingCaseId }),
      actorType: 'SYSTEM',
      channelId: request.channelId
    }));
    return ids.map(String);
  }
}

module.exports = { AuditService };
