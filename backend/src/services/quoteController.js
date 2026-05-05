class QuoteController {
  constructor({ quoteOrchestrationService, referenceDataService, consentAuditService, quoteQueryService, auditQueryService }) {
    this.quoteOrchestrationService = quoteOrchestrationService;
    this.referenceDataService = referenceDataService;
    this.consentAuditService = consentAuditService;
    this.quoteQueryService = quoteQueryService;
    this.auditQueryService = auditQueryService;
  }

  async generateQuote(req, res, next) {
    try {
      const response = await this.quoteOrchestrationService.generateQuote(req.body);
      res.status(response.status === 'SUCCESS' ? 200 : 400).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getReferenceData(req, res, next) {
    try {
      const response = await this.referenceDataService.getReferenceData(req.query);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async recordConsentAttempt(req, res, next) {
    try {
      const response = await this.consentAuditService.recordConsentAttempt(req.body);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getQuoteDetails(req, res, next) {
    try {
      const response = await this.quoteQueryService.getQuoteDetails(req.params.quoteId, req.query.requestId);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getQuoteAuditTrail(req, res, next) {
    try {
      const response = await this.auditQueryService.getQuoteAuditTrail(req.params.quoteId, req.query.requestId);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { QuoteController };
