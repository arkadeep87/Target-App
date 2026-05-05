class UnderwritingRoutingService {
  constructor({ ruleConfigurationService, underwritingRepository }) {
    this.ruleConfigurationService = ruleConfigurationService;
    this.underwritingRepository = underwritingRepository;
  }

  async resolve(request, pricingMode) {
    const route = await this.ruleConfigurationService.getUnderwritingRoute({ request, pricingMode });
    if (!route) {
      throw new Error('Underwriting routing configuration not found.');
    }
    return route;
  }

  async createCase({ client, request, quoteId, route }) {
    return this.underwritingRepository.insertUnderwritingCase(client, {
      quoteId,
      customerId: request.customerId,
      countryCode: request.countryCode,
      status: route.target_status,
      routeReason: 'COUNTRY_ROUTE',
      routeRuleId: route.underwriting_route_rule_id,
      createdByService: 'QuoteOrchestrationService'
    });
  }
}

module.exports = { UnderwritingRoutingService };
