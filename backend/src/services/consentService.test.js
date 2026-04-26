jest.mock('../../src/repositories/referenceDataRepository', () => ({ isConsentRequired: jest.fn() }));
jest.mock('../../src/repositories/consentRepository', () => ({ saveGrantedConsent: jest.fn() }));
jest.mock('../../src/services/auditService', () => ({ recordGdprRejection: jest.fn() }));

const consentService = require('../../src/services/consentService');
const referenceDataRepository = require('../../src/repositories/referenceDataRepository');
const consentRepository = require('../../src/repositories/consentRepository');
const auditService = require('../../src/services/auditService');

describe('consentService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('records granted consent evidence and continues', async () => {
    referenceDataRepository.isConsentRequired.mockResolvedValue(true);
    consentRepository.saveGrantedConsent.mockResolvedValue({});
    await expect(consentService.processConsent({ countryCode: 'ES', quoteDate: '2026-04-26', gdprConsent: true, customerId: 'C1', requestId: 'R1' })).resolves.toBeUndefined();
    expect(consentRepository.saveGrantedConsent).toHaveBeenCalled();
  });

  test('creates rejection audit before throwing consent failure', async () => {
    referenceDataRepository.isConsentRequired.mockResolvedValue(true);
    auditService.recordGdprRejection.mockResolvedValue({ audit_event_id: 99 });
    await expect(consentService.processConsent({ countryCode: 'ES', quoteDate: '2026-04-26', gdprConsent: false, customerId: 'C1', requestId: 'R1' })).rejects.toMatchObject({ code: 'CONSENT_REQUIRED', rejectedStage: 'CONSENT', auditReferenceId: 99 });
    expect(auditService.recordGdprRejection).toHaveBeenCalled();
  });
});
