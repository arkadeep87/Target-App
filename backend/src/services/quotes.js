const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');

router.post('/quotes', quoteController.generateQuote);
router.get('/quotes/reference-data', quoteController.getReferenceData);
router.get('/quotes/:quoteId', quoteController.getQuoteById);
router.get('/quotes/:quoteId/trace', quoteController.getQuoteTrace);

module.exports = router;
