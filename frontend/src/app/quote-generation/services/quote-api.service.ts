import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  QuoteRequest,
  QuoteResponse,
  QuoteReferenceDataResponse,
  ConsentAttemptRequest,
  ConsentAttemptResponse
} from '../models/quote.models';

@Injectable({ providedIn: 'root' })
export class QuoteApiService {
  constructor(private readonly http: HttpClient) {}

  getReferenceData(countryCode?: string, policyType?: string, effectiveDate?: string): Observable<QuoteReferenceDataResponse> {
    let params = new HttpParams();
    if (countryCode) params = params.set('countryCode', countryCode);
    if (policyType) params = params.set('policyType', policyType);
    if (effectiveDate) params = params.set('effectiveDate', effectiveDate);
    return this.http.get<QuoteReferenceDataResponse>('/api/quotes/reference-data', { params });
  }

  generateQuote(payload: QuoteRequest): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>('/api/quotes', payload);
  }

  recordConsentAttempt(payload: ConsentAttemptRequest): Observable<ConsentAttemptResponse> {
    return this.http.post<ConsentAttemptResponse>('/api/quotes/consent-attempts', payload);
  }

  getQuoteDetails(quoteId: string, requestId: string): Observable<QuoteResponse> {
    return this.http.get<QuoteResponse>(`/api/quotes/${quoteId}`, {
      params: new HttpParams().set('requestId', requestId)
    });
  }
}
