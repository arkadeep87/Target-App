import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuoteResultsSummaryComponent } from './quote-results-summary.component';

describe('QuoteResultsSummaryComponent', () => {
  let component: QuoteResultsSummaryComponent;
  let fixture: ComponentFixture<QuoteResultsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuoteResultsSummaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteResultsSummaryComponent);
    component = fixture.componentInstance;
    component.result = {
      quoteId: 'Q123',
      countryCode: 'DE',
      policyType: 'HEALTH',
      coverageAmount: 100000,
      basePremium: 425.0,
      riskFactor: 1.08,
      discountAmount: 17.0,
      taxAmount: 89.25,
      countryAdjustmentAmount: 20.5,
      paymentSurchargeAmount: 0,
      finalPremium: 517.75,
      underwritingStatus: 'EU_COMPLIANCE',
      workflowPathUsed: 'ALT_TAX',
      chargeLines: [
        { lineSequenceNo: 1, chargeCode: 'BASE_PREMIUM', amount: 425.0 },
        { lineSequenceNo: 2, chargeCode: 'TAX', amount: 89.25 }
      ],
      pricingExplanationNotes: ['Germany insurance duty applied.']
    };
    fixture.detectChanges();
  });

  it('should render quote identifier', () => {
    expect(fixture.nativeElement.textContent).toContain('Q123');
  });

  it('should render charge lines in deterministic order', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('1 - BASE_PREMIUM - 425');
    expect(text).toContain('2 - TAX - 89.25');
  });

  it('should render pricing explanation notes', () => {
    expect(fixture.nativeElement.textContent).toContain('Germany insurance duty applied.');
  });
});
