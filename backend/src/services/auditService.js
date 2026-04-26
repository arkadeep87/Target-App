const auditRepository = require('../repositories/auditRepository');

async function recordQuoteCompletion(quoteId, request) {
  return auditRepository.create({
    quoteId,
    requestId: request.requestId,
    customerId: request.customerId,
    eventType: 'QUOTE_COMPLETION',
    eventStage: 'COMPLETION',
    eventMessage: 'Quote completed successfully',
    eventOutcome: 'SUCCESS'
  });
}

async function recordGdprRejection(request) {
  return auditRepository.create({
    quoteId: null,
    requestId: request.requestId,
    customerId: request.customerId,
    eventType: 'GDPR_REJECTION',
    eventStage: 'CONSENT',
    eventMessage: 'Quote rejected because required GDPR consent was not granted',
    eventOutcome: 'REJECTED'
  });
}

module.exports = { recordQuoteCompletion, recordGdprRejection };
