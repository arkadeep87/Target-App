class ReferenceDataValidationService {
  constructor({ customerProfileRepository, referenceDataRepository, auditService }) {
    this.customerProfileRepository = customerProfileRepository;
    this.referenceDataRepository = referenceDataRepository;
    this.auditService = auditService;
  }

  async validate(request) {
    const customerExists = await this.customerProfileRepository.isActiveCustomer(request.customerId);
    if (!customerExists) {
      const error = new Error('Customer profile data is missing.');
      error.statusCode = 400;
      error.businessOutcomeCode = 'CUSTOMER_PROFILE_MISSING';
      throw error;
    }

    const productActive = await this.referenceDataRepository.isActiveProduct(request.countryCode, request.policyType);
    if (!productActive) {
      const error = new Error('Selected policy type is missing or inactive.');
      error.statusCode = 400;
      error.businessOutcomeCode = 'POLICY_TYPE_INACTIVE';
      throw error;
    }

    const frequencyActive = await this.referenceDataRepository.isActivePaymentFrequency(request.paymentFrequency);
    if (!frequencyActive) {
      const error = new Error('Selected payment frequency is missing or inactive.');
      error.statusCode = 400;
      error.businessOutcomeCode = 'PAYMENT_FREQUENCY_INACTIVE';
      throw error;
    }
  }
}

module.exports = { ReferenceDataValidationService };
