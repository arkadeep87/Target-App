class SupportedCountryValidator {
  constructor({ referenceDataRepository }) {
    this.referenceDataRepository = referenceDataRepository;
  }

  async validate(countryCode) {
    const supported = await this.referenceDataRepository.isSupportedCountry(countryCode);
    if (!supported) {
      const error = new Error('Selected country is not supported for quote generation.');
      error.statusCode = 400;
      error.businessOutcomeCode = 'UNSUPPORTED_COUNTRY';
      throw error;
    }
  }
}

module.exports = { SupportedCountryValidator };
