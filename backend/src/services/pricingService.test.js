jest.mock('../../src/repositories/basePremiumRepository', () => ({ findRule: jest.fn() }));
jest.mock('../../src/repositories/riskRepository', () => ({ findRule: jest.fn() }));
jest.mock('../../src/repositories/discountRepository', () => ({ findRule: jest.fn() }));
jest.mock('../../src/repositories/workflowRepository', () => ({ resolvePath: jest.fn() }));
jest.mock('../../src/repositories/taxRepository', () => ({ findMainWorkflowRule: jest.fn(), findAltTaxRule: jest.fn() }));
jest.mock('../../src/repositories/surchargeRepository', () => ({ findRule: jest.fn() }));
jest.mock('../../src/services/countryPricingService', () => ({ calculateCountryAdjustment: jest.fn() }));
jest.mock('../../src/services/pricingExplanationService', () => ({ buildNotes: jest.fn() }));

const basePremiumRepository = require('../../src/repositories/basePremiumRepository');
const riskRepository = require('../../src/repositories/riskRepository');
const discountRepository = require('../../src/repositories/discountRepository');
const workflowRepository = require('../../src/repositories/workflowRepository');
const taxRepository = require('../../src/repositories/taxRepository');
const surchargeRepository = require('../../src/repositories/surchargeRepository');
const countryPricingService = require('../../src/services/countryPricingService');
const explanationService = require('../../src/services/pricingExplanationService');
const pricingService = require('../../src/services/pricingService');

describe('pricingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    basePremiumRepository.findRule.mockResolvedValue({ base_premium_rule_id: 1, rate_per_thousand: 4.25, version_no: 1 });
    riskRepository.findRule.mockResolvedValue({ risk_model_rule_id: 2, risk_factor: 1.08, version_no: 1 });
    discountRepository.findRule.mockResolvedValue({ discount_rule_id: 3, discount_percent: 4.0, version_no: 1 });
    surchargeRepository.findRule.mockResolvedValue(null);
    countryPricingService.calculateCountryAdjustment.mockResolvedValue({ finalAmount: 15, sourceProvenance: 'CONFIGURED_RULE_SOURCE', appliedRules: [] });
    explanationService.buildNotes.mockResolvedValue(['Country-specific pricing adjustments were applied.']);
  });

  test('calculates migration baseline components using configured rules', async () => {
    workflowRepository.resolvePath.mockResolvedValue('MAIN');
    taxRepository.findMainWorkflowRule.mockResolvedValue({ tax_rule_id: 4, tax_rate_percent: 9.0, version_no: 1 });
    const result = await pricingService.calculateQuote({ countryCode: 'ES', policyType: 'TRAVEL', customerAge: 30, customerSegment: 'STANDARD', coverageAmount: 100000, paymentFrequency: 'ANNUAL', quoteDate: '2026-04-26' });
    expect(result.basePremium).toBe(425);
    expect(result.riskFactor).toBe(1.08);
    expect(result.discountAmount).toBe(17);
    expect(result.taxAmount).toBe(38.25);
  });

  test('creates explicit TAX charge line in alternate workflow path', async () => {
    workflowRepository.resolvePath.mockResolvedValue('ALT_TAX');
    taxRepository.findAltTaxRule.mockResolvedValue({ tax_rule_id: 5, tax_rate_percent: 13.5, version_no: 1 });
    const result = await pricingService.calculateQuote({ countryCode: 'ES', policyType: 'TRAVEL', customerAge: 30, customerSegment: 'STANDARD', coverageAmount: 100000, paymentFrequency: 'ANNUAL', quoteDate: '2026-04-26' });
    expect(result.workflowPathUsed).toBe('ALT_TAX');
    expect(result.chargeLines.some(x => x.chargeCode === 'TAX')).toBe(true);
  });
});
