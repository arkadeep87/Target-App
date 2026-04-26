const validationService = require('../../src/services/validationService');

describe('validationService', () => {
  test('rejects missing mandatory fields before pricing', async () => {
    await expect(validationService.validateMandatoryRequest({})).rejects.toMatchObject({ code: 'MANDATORY_VALIDATION_FAILED', rejectedStage: 'VALIDATION' });
  });

  test('rejects unsupported country', async () => {
    await expect(validationService.validateSupportedCountry('XX')).rejects.toMatchObject({ code: 'UNSUPPORTED_COUNTRY' });
  });

  test('rejects coverage below minimum', async () => {
    await expect(validationService.validateCoverageBounds({ coverageAmount: 1000 }, { productReference: { min_coverage_amount: 5000, max_coverage_amount: 100000 } })).rejects.toMatchObject({ code: 'COVERAGE_BELOW_MINIMUM' });
  });

  test('rejects coverage above maximum', async () => {
    await expect(validationService.validateCoverageBounds({ coverageAmount: 200000 }, { productReference: { min_coverage_amount: 5000, max_coverage_amount: 100000 } })).rejects.toMatchObject({ code: 'COVERAGE_ABOVE_MAXIMUM' });
  });
});
