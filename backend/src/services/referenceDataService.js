class ReferenceDataService {
  constructor({ referenceDataRepository }) {
    this.referenceDataRepository = referenceDataRepository;
  }

  async getReferenceData(query) {
    const effectiveDate = query.effectiveDate || new Date().toISOString();
    return this.referenceDataRepository.getReferenceDataBundle({
      countryCode: query.countryCode,
      policyType: query.policyType,
      effectiveDate
    });
  }
}

module.exports = { ReferenceDataService };
