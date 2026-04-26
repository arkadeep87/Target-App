jest.mock('../../src/services/validationService', () => ({
  validateMandatoryRequest: jest.fn(),
  validateSupportedCountry: jest.fn(),
  validateEligibility: jest.fn(),
  validateCoverageBounds: jest.fn()
}));
jest.mock('../../src/services/consentService', () => ({ processConsent: jest.fn() }));
jest.mock('../../src/services/referenceDataService', () => ({ resolveReferenceSnapshot: jest.fn() }));
jest.mock('../../src/services/pricingService', () => ({ calculateQuote: jest.fn() }));
jest.mock('../../src/services/persistenceService', () => ({ persistSuccessfulQuote: jest.fn() }));
jest.mock('../../src/services/underwritingService', () => ({ createUnderwritingCase: jest.fn() }));
jest.mock('../../src/services/auditService', () => ({ recordQuoteCompletion: jest.fn() }));
jest.mock('../../src/repositories/idempotencyRepository', () => ({ findByKey: jest.fn(), save: jest.fn() }));

const service = require('../../src/services/quoteOrchestrationService');
const validationService = require('../../src/services/validationService');
const consentService = require('../../src/services/consentService');
const referenceDataService = require('../../src/services/referenceDataService');
const pricingService = require('../../src/services/pricingService');
const persistenceService = require('../../src/services/persistenceService');
const underwritingService = require('../../src/services/underwritingService');
const auditService = require('../../src/services/auditService');
const idempotencyRepository = require('../../src/repositories/idempotencyRepository');

describe('quoteOrchestrationService', () => {
  const request = {
    requestId: 'R1',
    idempotencyKey: 'I1',
    customerId: 'C1',
    customerAge: 30,
    countryCode: 'ES',
    policyType: 'TRAVEL',
    coverageAmount: 100000,
    paymentFrequency: 'ANNUAL',
    customerSegment: 'STANDARD',
    gdprConsent: true,
    quoteDate: '2026-04-26'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    idempotencyRepository.findByKey.mockResolvedValue(null);
    referenceDataService.resolveReferenceSnapshot.mockResolvedValue({});
    pricingService.calculateQuote.mockResolvedValue({
      basePremium: 425,
      riskFactor: 1.08,
      discountAmount: 17,
      taxAmount: 38.25,
      countryAdjustmentAmount: 10,
      paymentSurchargeAmount: 0,
      finalPremium: 490.25,
      workflowPathUsed: 'MAIN',
      pricingBasis: {},
      appliedRuleVersionIds: [],
      chargeLines: [],
      pricingExplanationNotes: []
    });
    persistenceService.persistSuccessfulQuote.mockResolvedValue({ quoteId: 'Q1' });
    underwritingService.createUnderwritingCase.mockResolvedValue({ underwriting_case_id: 'UW1', case_status: 'EU_COMPLIANCE' });
    auditService.recordQuoteCompletion.mockResolvedValue({});
  });

  test('returns cached response for duplicate idempotency key', async () => {
    idempotencyRepository.findByKey.mockResolvedValue({ response_payload: { quoteId: 'QX', status: 'SUCCESS' } });
    const result = await service.generateQuote(request);
    expect(result.quoteId).toBe('QX');
    expect(pricingService.calculateQuote).not.toHaveBeenCalled();
  });

  test('persists and routes only after validations and pricing pass', async () => {
    const result = await service.generateQuote(request);
    expect(validationService.validateMandatoryRequest).toHaveBeenCalledBefore(pricingService.calculateQuote);
    expect(pricingService.calculateQuote).toHaveBeenCalledBefore(persistenceService.persistSuccessfulQuote);
    expect(persistenceService.persistSuccessfulQuote).toHaveBeenCalledBefore(underwritingService.createUnderwritingCase);
    expect(result.quoteId).toBe('Q1');
  });

  test('does not persist quote when consent fails', async () => {
    consentService.processConsent.mockRejectedValue(Object.assign(new Error('consent failed'), { code: 'CONSENT_REQUIRED' }));
    await expect(service.generateQuote(request)).rejects.toMatchObject({ code: 'CONSENT_REQUIRED' });
    expect(persistenceService.persistSuccessfulQuote).not.toHaveBeenCalled();
    expect(underwritingService.createUnderwritingCase).not.toHaveBeenCalled();
  });
});
