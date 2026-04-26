import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-validation-error-panel',
  template: `
    <div *ngIf="errorResponse" class="error-panel">
      <div>{{ errorResponse.message }}</div>
      <ul *ngIf="errorResponse.fieldErrors?.length">
        <li *ngFor="let fieldError of errorResponse.fieldErrors">{{ fieldError.field }}: {{ fieldError.message }}</li>
      </ul>
    </div>
  `
})
export class ValidationErrorPanelComponent {
  @Input() errorResponse: any;
}
