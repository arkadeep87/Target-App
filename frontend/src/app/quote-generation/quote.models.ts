export interface QuoteRequest {
  customerId: string;
  customerAge: number;
  countryCode: string;
  policyType: string;
  coverageAmount: number;
  paymentFrequency: string;
  customerSegment: string;
  consentStatus: 'CONSENTED' | 'DECLINED' | 'MISSING';
  consentCapturedAt?: string;
  channelId: string;
  requestId: string;
}

export interface ChargeLine {
  sequenceNumber: number;
  chargeType: string;
  chargeSubtype?: string;
  amount: number;
  currencyCode?: string;
  calculationBasis?: string;
  rateOrFixedValue?: number;
  sourceRuleFamily?: string;
  sourceRuleId?: string;
  sourcePrecedenceLevel?: number;
  businessDescription?: string;
}

export interface PricingBreakdown {
  basePremium: number;
  appliedBaseRate: number;
  riskFactor: number;
  discountAmount: number;
  taxAmount: number;
  premiumAfterCoreRules: number;
  countryAdjustmentAmount: number;
  paymentFrequencySurchargeAmount: number;
  finalPremium: number;
  chargeLines: ChargeLine[];
}

export interface QuoteResponse {
  requestId: string;
  quoteId?: string;
  status: string;
  businessOutcomeCode: string;
  businessMessage: string;
  countryCode?: string;
  policyType?: string;
  coverageAmount?: number;
  paymentFrequency?: string;
  pricingBreakdown?: PricingBreakdown;
  underwritingCaseId?: string;
  underwritingStatus?: string;
  ruleTraceId?: string;
  auditEventIds?: string[];
  createdAt?: string;
}

export interface SupportedCountry {
  countryCode: string;
  displayName: string;
}

export interface ProductCoverageLimit {
  policyType: string;
  minimumCoverAmount: number;
  maximumCoverAmount: number;
}

export interface QuoteReferenceDataResponse {
  supportedCountries: SupportedCountry[];
  availablePolicyTypes: string[];
  availablePaymentFrequencies: string[];
  productCoverageLimits: ProductCoverageLimit[];
  countrySpecificHints: Record<string, string[]>;
  consentTextVersion: string;
  referenceVersion: string;
}

export interface ConsentAttemptRequest {
  customerId: string;
  countryCode: string;
  policyType: string;
  consentStatus: 'CONSENTED' | 'DECLINED' | 'MISSING';
  consentCapturedAt?: string;
  channelId: string;
  requestId: string;
}

export interface ConsentAttemptResponse {
  requestId: string;
  consentAuditId: string;
  status: string;
  businessOutcomeCode: string;
  businessMessage: string;
  recordedAt: string;
}
