import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [],
  template: `
    <div class="toast-stack">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class.toast-error]="toast.kind === 'error'">
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .toast {
        background: var(--ink);
        color: #fff;
        padding: 12px 18px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: var(--shadow);
        border-left: 4px solid var(--accent);
        max-width: 320px;
      }
      .toast-error {
        border-left-color: var(--bad);
      }
    `,
  ],
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
}
