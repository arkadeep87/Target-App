import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuoteApiService } from './quote-api.service';

describe('QuoteApiService', () => {
  let service: QuoteApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(QuoteApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should call reference data endpoint', () => {
    service.getReferenceData('ES', 'TRAVEL', '2026-05-05').subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/quotes/reference-data');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('countryCode')).toBe('ES');
    req.flush({ supportedCountries: [], availablePolicyTypes: [], availablePaymentFrequencies: [], productCoverageLimits: [], countrySpecificHints: {}, consentTextVersion: 'v1', referenceVersion: 'v1' });
  });

  it('should call generate quote endpoint', () => {
    service.generateQuote({
      customerId: 'C1', customerAge: 30, countryCode: 'ES', policyType: 'TRAVEL', coverageAmount: 100000,
      paymentFrequency: 'ANNUAL', customerSegment: 'STANDARD', consentStatus: 'CONSENTED', consentCapturedAt: '2026-05-05T00:00:00Z',
      channelId: 'ANGULAR_UI', requestId: 'REQ1'
    }).subscribe();
    const req = httpMock.expectOne('/api/quotes');
    expect(req.request.method).toBe('POST');
    req.flush({ requestId: 'REQ1', status: 'SUCCESS', businessOutcomeCode: 'QUOTE_CREATED', businessMessage: 'ok' });
  });
});
