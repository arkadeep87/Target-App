import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { QuoteApiService } from '../../services/quote-api.service';
import {
  ProductCoverageLimit,
  QuoteReferenceDataResponse,
  QuoteRequest,
  QuoteResponse
} from '../../models/quote.models';

@Component({
  selector: 'app-quote-entry-form',
  templateUrl: './quote-entry-form.component.html'
})
export class QuoteEntryFormComponent implements OnInit {
  referenceData?: QuoteReferenceDataResponse;
  result?: QuoteResponse;
  loading = false;
  structuralMessage = '';
  selectedCoverageLimit?: ProductCoverageLimit;

  readonly form = this.fb.group({
    customerId: ['', [Validators.required]],
    customerAge: [null, [Validators.required, Validators.min(0)]],
    countryCode: ['', [Validators.required]],
    policyType: ['', [Validators.required]],
    coverageAmount: [null, [Validators.required, Validators.min(0.01)]],
    paymentFrequency: ['', [Validators.required]],
    customerSegment: ['', [Validators.required]],
    consentStatus: ['', [Validators.required]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly quoteApi: QuoteApiService
  ) {}

  ngOnInit(): void {
    this.loadReferenceData();
    this.form.get('policyType')?.valueChanges.subscribe(() => this.syncCoverageLimit());
    this.form.get('countryCode')?.valueChanges.subscribe((countryCode) => {
      this.loadReferenceData(countryCode || undefined, this.form.get('policyType')?.value || undefined);
    });
  }

  loadReferenceData(countryCode?: string, policyType?: string): void {
    this.quoteApi.getReferenceData(countryCode, policyType, new Date().toISOString()).subscribe({
      next: (data) => {
        this.referenceData = data;
        this.syncCoverageLimit();
      },
      error: () => {
        this.structuralMessage = 'Reference data could not be loaded.';
      }
    });
  }

  syncCoverageLimit(): void {
    const policyType = this.form.get('policyType')?.value;
    this.selectedCoverageLimit = this.referenceData?.productCoverageLimits.find(x => x.policyType === policyType);
  }

  get coverageGuidance(): string {
    if (!this.selectedCoverageLimit) return '';
    return `Permitted range: ${this.selectedCoverageLimit.minimumCoverAmount} - ${this.selectedCoverageLimit.maximumCoverAmount}`;
  }

  get outOfRangeHint(): string {
    const coverageAmount = Number(this.form.get('coverageAmount')?.value);
    if (!this.selectedCoverageLimit || !coverageAmount) return '';
    if (coverageAmount < this.selectedCoverageLimit.minimumCoverAmount || coverageAmount > this.selectedCoverageLimit.maximumCoverAmount) {
      return 'Requested cover is outside the permitted product range.';
    }
    return '';
  }

  submit(): void {
    this.structuralMessage = '';
    this.result = undefined;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.structuralMessage = 'Please complete all required fields with valid values.';
      return;
    }

    const raw = this.form.getRawValue();
    const request: QuoteRequest = {
      customerId: String(raw.customerId),
      customerAge: Number(raw.customerAge),
      countryCode: String(raw.countryCode),
      policyType: String(raw.policyType),
      coverageAmount: Number(raw.coverageAmount),
      paymentFrequency: String(raw.paymentFrequency),
      customerSegment: String(raw.customerSegment),
      consentStatus: raw.consentStatus as 'CONSENTED' | 'DECLINED' | 'MISSING',
      consentCapturedAt: raw.consentStatus === 'CONSENTED' ? new Date().toISOString() : undefined,
      channelId: 'ANGULAR_UI',
      requestId: crypto.randomUUID()
    };

    this.loading = true;
    this.quoteApi.generateQuote(request).subscribe({
      next: (response) => {
        this.result = response;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.result = error?.error || {
          requestId: request.requestId,
          status: 'ERROR',
          businessOutcomeCode: 'REQUEST_FAILED',
          businessMessage: 'Quote request could not be completed.'
        };
      }
    });
  }
}
