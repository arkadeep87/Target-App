const consentRepository = require('../repositories/consentRepository');
const auditService = require('./auditService');
const referenceDataRepository = require('../repositories/referenceDataRepository');

async function processConsent(request) {
  const consentRequired = await referenceDataRepository.isConsentRequired(request.countryCode, request.quoteDate);
  if (consentRequired && !request.gdprConsent) {
    const auditEvent = await auditService.recordGdprRejection(request);
    const err = new Error('GDPR consent is required for quote processing.');
    err.code = 'CONSENT_REQUIRED';
    err.category = 'COMPLIANCE';
    err.rejectedStage = 'CONSENT';
    err.auditReferenceId = auditEvent.audit_event_id;
    throw err;
  }
  if (request.gdprConsent) {
    await consentRepository.saveGrantedConsent(request);
  }
}

module.exports = { processConsent };
