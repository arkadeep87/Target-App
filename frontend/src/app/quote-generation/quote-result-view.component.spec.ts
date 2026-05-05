import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuoteResultViewComponent } from './quote-result-view.component';
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-country-breakdown-panel', template: '' })
class StubCountryPanel { @Input() result: any; }

describe('QuoteResultViewComponent', () => {
  let component: QuoteResultViewComponent;
  let fixture: ComponentFixture<QuoteResultViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuoteResultViewComponent, StubCountryPanel]
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteResultViewComponent);
    component = fixture.componentInstance;
    component.result = {
      requestId: 'REQ1',
      quoteId: 'Q1',
      status: 'SUCCESS',
      businessOutcomeCode: 'QUOTE_CREATED',
      businessMessage: 'ok',
      pricingBreakdown: {
        basePremium: 425,
        appliedBaseRate: 4.25,
        riskFactor: 1.1,
        discountAmount: 17,
        taxAmount: 38.25,
        premiumAfterCoreRules: 488.75,
        countryAdjustmentAmount: 8.8,
        paymentFrequencySurchargeAmount: 0,
        finalPremium: 497.55,
        chargeLines: [
          { sequenceNumber: 2, chargeType: 'TAX', amount: 38.25 },
          { sequenceNumber: 1, chargeType: 'BASE', amount: 425 }
        ]
      }
    } as any;
    fixture.detectChanges();
  });

  it('should sort charge lines by sequence number', () => {
    expect(component.chargeLines[0].chargeType).toBe('BASE');
    expect(component.chargeLines[1].chargeType).toBe('TAX');
  });
});
