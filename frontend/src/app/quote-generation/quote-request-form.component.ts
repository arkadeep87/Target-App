import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { QuoteApiService } from './quote-api.service';

@Component({
  selector: 'app-quote-request-form',
  templateUrl: './quote-request-form.component.html'
})
export class QuoteRequestFormComponent implements OnInit {
  loading = false;
  errorResponse: any = null;
  result: any = null;
  referenceData: any = { supportedCountries: [], availablePolicyTypes: [], availablePaymentFrequencies: [], countryGuidanceNotices: [], consentRequired: false };

  form = this.fb.group({
    requestId: ['', Validators.required],
    customerId: ['', Validators.required],
    customerAge: [null, [Validators.required, Validators.min(0)]],
    countryCode: ['', Validators.required],
    policyType: ['', Validators.required],
    coverageAmount: [null, [Validators.required, Validators.min(0.01)]],
    paymentFrequency: ['', Validators.required],
    customerSegment: ['', Validators.required],
    gdprConsent: [false, Validators.required],
    quoteDate: ['', Validators.required],
    requestedWorkflowPath: [''],
    idempotencyKey: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private quoteApi: QuoteApiService) {}

  ngOnInit(): void {
    this.loadReferenceData();
    this.form.get('countryCode')?.valueChanges.subscribe((countryCode) => {
      const quoteDate = this.form.get('quoteDate')?.value;
      if (countryCode && quoteDate) {
        this.loadReferenceData(countryCode, quoteDate);
      }
    });
    this.form.get('quoteDate')?.valueChanges.subscribe((quoteDate) => {
      const countryCode = this.form.get('countryCode')?.value;
      if (countryCode && quoteDate) {
        this.loadReferenceData(countryCode, quoteDate);
      }
    });
  }

  loadReferenceData(countryCode?: string, quoteDate?: string): void {
    this.quoteApi.getReferenceData(countryCode, quoteDate).subscribe({
      next: (data) => {
        this.referenceData = data;
      },
      error: () => {
        this.referenceData = { supportedCountries: [], availablePolicyTypes: [], availablePaymentFrequencies: [], countryGuidanceNotices: [], consentRequired: false };
      }
    });
  }

  submit(): void {
    this.errorResponse = null;
    this.result = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.quoteApi.generateQuote(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.result = response;
        this.loading = false;
      },
      error: (err) => {
        this.errorResponse = err.error || err;
        this.loading = false;
      }
    });
  }
}
