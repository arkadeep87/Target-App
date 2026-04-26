const referenceDataRepository = require('../repositories/referenceDataRepository');
const underwritingRepository = require('../repositories/underwritingRepository');

async function createUnderwritingCase(quoteId, request) {
  const statusRule = await referenceDataRepository.getUnderwritingStatusRule(request.countryCode, request.quoteDate);
  return underwritingRepository.create({
    quoteId,
    customerId: request.customerId,
    countryCode: request.countryCode,
    caseStatus: statusRule.default_status,
    statusMappingVersion: statusRule.version_no
  });
}

module.exports = { createUnderwritingCase };
