class RequestValidator {
  validate(request) {
    const required = ['customerId', 'customerAge', 'countryCode', 'policyType', 'coverageAmount', 'paymentFrequency', 'customerSegment', 'consentStatus', 'channelId', 'requestId'];
    for (const field of required) {
      if (request[field] === undefined || request[field] === null || request[field] === '') {
        const error = new Error(`Missing required field: ${field}`);
        error.statusCode = 400;
        error.businessOutcomeCode = 'STRUCTURAL_VALIDATION_FAILED';
        throw error;
      }
    }
    if (Number(request.customerAge) < 0 || Number(request.coverageAmount) <= 0) {
      const error = new Error('Invalid numeric values for age or coverage amount.');
      error.statusCode = 400;
      error.businessOutcomeCode = 'STRUCTURAL_VALIDATION_FAILED';
      throw error;
    }
  }
}

module.exports = { RequestValidator };
