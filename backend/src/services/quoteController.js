const quoteOrchestrationService = require('../services/quoteOrchestrationService');
const referenceDataService = require('../services/referenceDataService');
const quoteRepository = require('../repositories/quoteRepository');
const traceRepository = require('../repositories/traceRepository');

async function generateQuote(req, res) {
  try {
    const result = await quoteOrchestrationService.generateQuote(req.body);
    res.status(200).json(result);
  } catch (err) {
    const statusCode = err.httpStatus || 400;
    res.status(statusCode).json({
      status: 'REJECTED',
      errorCode: err.code || 'QUOTE_PROCESSING_ERROR',
      errorCategory: err.category || 'BUSINESS',
      message: err.message,
      fieldErrors: err.fieldErrors || [],
      rejectedStage: err.rejectedStage,
      auditReferenceId: err.auditReferenceId || null,
      processingTimestamp: new Date().toISOString()
    });
  }
}

async function getReferenceData(req, res) {
  const data = await referenceDataService.getSupportedReferenceData(req.query.countryCode, req.query.quoteDate);
  res.json(data);
}

async function getQuoteById(req, res) {
  const data = await quoteRepository.getQuoteById(req.params.quoteId);
  res.json(data);
}

async function getQuoteTrace(req, res) {
  const data = await traceRepository.getTraceByQuoteId(req.params.quoteId);
  res.json(data);
}

module.exports = { generateQuote, getReferenceData, getQuoteById, getQuoteTrace };
