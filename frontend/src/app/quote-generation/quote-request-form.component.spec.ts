import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { QuoteRequestFormComponent } from './quote-request-form.component';
import { QuoteApiService } from './quote-api.service';

describe('QuoteRequestFormComponent', () => {
  let component: QuoteRequestFormComponent;
  let fixture: ComponentFixture<QuoteRequestFormComponent>;
  let quoteApiSpy: jasmine.SpyObj<QuoteApiService>;

  beforeEach(async () => {
    quoteApiSpy = jasmine.createSpyObj('QuoteApiService', ['generateQuote', 'getReferenceData']);
    quoteApiSpy.getReferenceData.and.returnValue(of({ supportedCountries: [], availablePolicyTypes: [], availablePaymentFrequencies: [], countryGuidanceNotices: [], consentRequired: false }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [QuoteRequestFormComponent],
      providers: [{ provide: QuoteApiService, useValue: quoteApiSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not submit when form is invalid', () => {
    component.submit();
    expect(quoteApiSpy.generateQuote).not.toHaveBeenCalled();
  });

  it('should submit when form is valid', () => {
    quoteApiSpy.generateQuote.and.returnValue(of({ quoteId: 'Q1' }));
    component.form.patchValue({
      requestId: 'R1',
      customerId: 'C1',
      customerAge: 30,
      countryCode: 'ES',
      policyType: 'TRAVEL',
      coverageAmount: 100000,
      paymentFrequency: 'ANNUAL',
      customerSegment: 'STANDARD',
      gdprConsent: true,
      quoteDate: '2026-04-26',
      requestedWorkflowPath: 'ALT_TAX',
      idempotencyKey: 'I1'
    });
    component.submit();
    expect(quoteApiSpy.generateQuote).toHaveBeenCalled();
    expect(component.result.quoteId).toBe('Q1');
  });

  it('should capture structured business error response', () => {
    quoteApiSpy.generateQuote.and.returnValue(throwError(() => ({ error: { message: 'Unsupported country', errorCode: 'UNSUPPORTED_COUNTRY' } })));
    component.form.patchValue({
      requestId: 'R1',
      customerId: 'C1',
      customerAge: 30,
      countryCode: 'XX',
      policyType: 'TRAVEL',
      coverageAmount: 100000,
      paymentFrequency: 'ANNUAL',
      customerSegment: 'STANDARD',
      gdprConsent: true,
      quoteDate: '2026-04-26',
      requestedWorkflowPath: 'ALT_TAX',
      idempotencyKey: 'I1'
    });
    component.submit();
    expect(component.errorResponse.errorCode).toBe('UNSUPPORTED_COUNTRY');
  });
});
