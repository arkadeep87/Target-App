class CountryAdjustmentStrategyService {
  compose({ request, premiumAfterCoreRules, components, source, precedenceLevel }) {
    const chargeLines = [];
    let total = 0;
    let sequence = 4;

    for (const component of components) {
      let amount = 0;
      if (component.adjustment_type === 'PERCENTAGE') {
        amount = Number((Number(premiumAfterCoreRules) * Number(component.percentage_rate)).toFixed(2));
      } else if (component.adjustment_type === 'FIXED') {
        amount = Number(Number(component.fixed_amount).toFixed(2));
      }
      total = Number((total + amount).toFixed(2));
      chargeLines.push({
        sequenceNumber: sequence++,
        chargeType: component.fixed_amount && Number(component.fixed_amount) < 0 ? 'COUNTRY_SURCHARGE_OR_RELIEF' : 'COUNTRY_ADJUSTMENT',
        chargeSubtype: `${request.countryCode}_${component.component_code}`,
        amount,
        calculationBasis: component.adjustment_type === 'PERCENTAGE' ? 'PREMIUM_AFTER_CORE_RULES' : 'FIXED_AMOUNT',
        rateOrFixedValue: component.adjustment_type === 'PERCENTAGE' ? Number(component.percentage_rate) : Number(component.fixed_amount),
        sourceRuleFamily: 'COUNTRY_ADJUSTMENT',
        sourceRuleId: component.country_adjustment_rule_id,
        sourcePrecedenceLevel: precedenceLevel,
        businessDescription: component.business_description
      });
    }

    return {
      countryAdjustmentAmount: total,
      source,
      chargeLines,
      countryAdjustmentRuleIds: components.map(c => c.country_adjustment_rule_id)
    };
  }
}

module.exports = { CountryAdjustmentStrategyService };
