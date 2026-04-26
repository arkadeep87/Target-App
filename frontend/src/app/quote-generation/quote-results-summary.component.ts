import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-quote-results-summary',
  template: `
    <div *ngIf="result">
      <h3>Quote {{ result.quoteId }}</h3>
      <div>Country: {{ result.countryCode }}</div>
      <div>Policy: {{ result.policyType }}</div>
      <div>Coverage: {{ result.coverageAmount }}</div>
      <div>Base Premium: {{ result.basePremium }}</div>
      <div>Risk Factor: {{ result.riskFactor }}</div>
      <div>Discount: {{ result.discountAmount }}</div>
      <div>Tax: {{ result.taxAmount }}</div>
      <div>Country Adjustment: {{ result.countryAdjustmentAmount }}</div>
      <div>Payment Surcharge: {{ result.paymentSurchargeAmount }}</div>
      <div>Final Premium: {{ result.finalPremium }}</div>
      <div>Underwriting Status: {{ result.underwritingStatus }}</div>
      <div>Workflow Path: {{ result.workflowPathUsed }}</div>
      <ul>
        <li *ngFor="let line of result.chargeLines">{{ line.lineSequenceNo }} - {{ line.chargeCode }} - {{ line.amount }}</li>
      </ul>
      <div *ngIf="result.pricingExplanationNotes?.length">
        <h4>Notes</h4>
        <ul>
          <li *ngFor="let note of result.pricingExplanationNotes">{{ note }}</li>
        </ul>
      </div>
    </div>
  `
})
export class QuoteResultsSummaryComponent {
  @Input() result: any;
}
