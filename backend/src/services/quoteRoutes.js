const express = require('express');

module.exports = function quoteRoutes(deps) {
  const router = express.Router();
  const controller = deps.quoteController;

  router.post('/', controller.generateQuote.bind(controller));
  router.get('/reference-data', controller.getReferenceData.bind(controller));
  router.post('/consent-attempts', controller.recordConsentAttempt.bind(controller));
  router.get('/:quoteId/audit', controller.getQuoteAuditTrail.bind(controller));
  router.get('/:quoteId', controller.getQuoteDetails.bind(controller));

  return router;
};
