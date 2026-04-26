import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuoteApiService {
  constructor(private http: HttpClient) {}

  generateQuote(payload: any): Observable<any> {
    return this.http.post('/api/quotes', payload);
  }

  getQuote(quoteId: string): Observable<any> {
    return this.http.get(`/api/quotes/${quoteId}`);
  }

  getQuoteTrace(quoteId: string): Observable<any> {
    return this.http.get(`/api/quotes/${quoteId}/trace`);
  }

  getReferenceData(countryCode?: string, quoteDate?: string): Observable<any> {
    let params = new HttpParams();
    if (countryCode) params = params.set('countryCode', countryCode);
    if (quoteDate) params = params.set('quoteDate', quoteDate);
    return this.http.get('/api/quotes/reference-data', { params });
  }
}
