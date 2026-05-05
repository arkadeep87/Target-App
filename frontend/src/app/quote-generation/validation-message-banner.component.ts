import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-validation-message-banner',
  templateUrl: './validation-message-banner.component.html'
})
export class ValidationMessageBannerComponent {
  @Input() message = '';
  @Input() outcomeCode = '';
  @Input() status: 'SUCCESS' | 'REJECTED' | 'ERROR' | 'VALIDATION' | '' = '';

  get visible(): boolean {
    return !!this.message;
  }
}
