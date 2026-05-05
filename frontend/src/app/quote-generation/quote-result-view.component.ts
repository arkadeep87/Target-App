import { Component, Input } from '@angular/core';
import { QuoteResponse } from '../../models/quote.models';

@Component({
  selector: 'app-quote-result-view',
  templateUrl: './quote-result-view.component.html'
})
export class QuoteResultViewComponent {
  @Input() result!: QuoteResponse;

  get chargeLines() {
    return [...(this.result?.pricingBreakdown?.chargeLines || [])].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }
}
