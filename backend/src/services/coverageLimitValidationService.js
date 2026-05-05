class CoverageLimitValidationService {
  constructor({ referenceDataRepository }) {
    this.referenceDataRepository = referenceDataRepository;
  }

  async validate(request) {
    const limit = await this.referenceDataRepository.getCoverageLimit(request.countryCode, request.policyType);
    if (!limit) {
      const error = new Error('Product cover limits are unavailable.');
      error.statusCode = 400;
      error.businessOutcomeCode = 'COVER_LIMITS_UNAVAILABLE';
      throw error;
    }

    if (Number(request.coverageAmount) < Number(limit.minimumCoverAmount) || Number(request.coverageAmount) > Number(limit.maximumCoverAmount)) {
      const error = new Error('Requested cover is outside the permitted product range.');
      error.statusCode = 400;
      error.businessOutcomeCode = 'COVERAGE_OUT_OF_RANGE';
      throw error;
    }
  }
}

module.exports = { CoverageLimitValidationService };
