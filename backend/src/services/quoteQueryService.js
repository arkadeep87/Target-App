class QuoteQueryService {
  constructor({ quoteRepository }) {
    this.quoteRepository = quoteRepository;
  }

  async getQuoteDetails(quoteId) {
    return this.quoteRepository.getQuoteDetails(quoteId);
  }
}

module.exports = { QuoteQueryService };
