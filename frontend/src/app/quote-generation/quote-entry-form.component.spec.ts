import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { QuoteEntryFormComponent } from './quote-entry-form.component';
import { QuoteApiService } from '../../services/quote-api.service';
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-validation-message-banner', template: '' })
class StubBannerComponent { @Input() message = ''; @Input() outcomeCode = ''; @Input() status: any; }
@Component({ selector: 'app-quote-result-view', template: '' })
class StubResultComponent { @Input() result: any; }

describe('QuoteEntryFormComponent', () => {
  let component: QuoteEntryFormComponent;
  let fixture: ComponentFixture<QuoteEntryFormComponent>;
  let quoteApiSpy: jasmine.SpyObj<QuoteApiService>;

  beforeEach(async () => {
    quoteApiSpy = jasmine.createSpyObj('QuoteApiService', ['getReferenceData', 'generateQuote']);
    quoteApiSpy.getReferenceData.and.returnValue(of({
      supportedCountries: [
        { countryCode: 'ES', displayName: 'Spain' },
        { countryCode: 'DE', displayName: 'Germany' },
        { countryCode: 'IT', displayName: 'Italy' },
        { countryCode: 'PT', displayName: 'Portugal' },
        { countryCode: 'CH', displayName: 'Switzerland' },
        { countryCode: 'GB', displayName: 'United Kingdom' }
      ],
      availablePolicyTypes: ['TRAVEL', 'HEALTH', 'FAMILY', 'CORPORATE'],
      availablePaymentFrequencies: ['ANNUAL', 'MONTHLY', 'QUARTERLY'],
      productCoverageLimits: [{ policyType: 'TRAVEL', minimumCoverAmount: 1000, maximumCoverAmount: 200000 }],
      countrySpecificHints: {},
      consentTextVersion: 'v1',
      referenceVersion: 'v1'
    }));
    quoteApiSpy.generateQuote.and.returnValue(of({ requestId: 'REQ1', status: 'SUCCESS', businessOutcomeCode: 'QUOTE_CREATED', businessMessage: 'Quote created' }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [QuoteEntryFormComponent, StubBannerComponent, StubResultComponent],
      providers: [{ provide: QuoteApiService, useValue: quoteApiSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteEntryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load supported multi-country options from reference data', () => {
    expect(component.referenceData?.supportedCountries.map(c => c.countryCode)).toEqual(['ES', 'DE', 'IT', 'PT', 'CH', 'GB']);
  });

  it('should block submit when structural validation fails', () => {
    component.submit();
    expect(component.structuralMessage).toContain('Please complete all required fields');
    expect(quoteApiSpy.generateQuote).not.toHaveBeenCalled();
  });

  it('should show out-of-range guidance when coverage amount exceeds configured range', () => {
    component.form.patchValue({ policyType: 'TRAVEL', coverageAmount: 300000 });
    component.syncCoverageLimit();
    expect(component.outOfRangeHint).toContain('outside the permitted product range');
  });
});
