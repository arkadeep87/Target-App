class AuditQueryService {
  constructor({ auditRepository }) {
    this.auditRepository = auditRepository;
  }

  async getQuoteAuditTrail(quoteId) {
    return this.auditRepository.getQuoteAuditTrail(quoteId);
  }
}

module.exports = { AuditQueryService };
