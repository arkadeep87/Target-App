class EligibilityDecisionService {
  constructor({ ruleConfigurationService }) {
    this.ruleConfigurationService = ruleConfigurationService;
  }

  async evaluate(request) {
    const rule = await this.ruleConfigurationService.getEligibilityRule(request);
    if (!rule) {
      return {
        accepted: false,
        reasonCode: 'ELIGIBILITY_RULE_NOT_FOUND',
        reasonText: 'Eligibility rules are unavailable for the selected quote scenario.',
        eligibilityRuleId: null
      };
    }

    const accepted = Number(request.customerAge) >= Number(rule.min_age)
      && Number(request.customerAge) <= Number(rule.max_age)
      && Number(request.coverageAmount) >= Number(rule.min_coverage_amount)
      && Number(request.coverageAmount) <= Number(rule.max_coverage_amount);

    return accepted
      ? { accepted: true, reasonCode: 'ELIGIBLE', reasonText: 'Eligible for pricing.', eligibilityRuleId: rule.eligibility_rule_id }
      : { accepted: false, reasonCode: 'ELIGIBILITY_REJECTED', reasonText: 'Quote request is not eligible for pricing.', eligibilityRuleId: rule.eligibility_rule_id };
  }
}

module.exports = { EligibilityDecisionService };
