import { Component, Input } from '@angular/core';
import { QuoteResponse } from '../../models/quote.models';

@Component({
  selector: 'app-country-breakdown-panel',
  templateUrl: './country-breakdown-panel.component.html'
})
export class CountryBreakdownPanelComponent {
  @Input() result!: QuoteResponse;

  get lines() {
    return this.result?.pricingBreakdown?.chargeLines || [];
  }

  linesByCountrySubtypes(prefixes: string[]): any[] {
    return this.lines.filter(line => prefixes.some(prefix => (line.chargeSubtype || '').startsWith(prefix)));
  }
}
