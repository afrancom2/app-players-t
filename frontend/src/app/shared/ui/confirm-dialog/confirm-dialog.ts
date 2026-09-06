import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  template: `
    @if (service.pending(); as request) {
      <div class="backdrop" (click)="service.resolve(false)">
        <div class="dialog" (click)="$event.stopPropagation()" role="alertdialog" aria-modal="true">
          <h3>{{ request.title }}</h3>
          <p>{{ request.message }}</p>
          <div class="actions">
            <button class="btn btn-secondary" (click)="service.resolve(false)">Cancelar</button>
            <button class="btn btn-danger" (click)="service.resolve(true)">{{ request.confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(18, 21, 15, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 900;
        padding: 20px;
      }
      .dialog {
        background: var(--surface);
        border-radius: 12px;
        padding: 28px;
        max-width: 380px;
        width: 100%;
        box-shadow: var(--shadow);
      }
      .dialog p {
        color: var(--ink-soft);
        margin: 12px 0 22px;
        font-size: 14.5px;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    `,
  ],
})
export class ConfirmDialog {
  protected readonly service = inject(ConfirmDialogService);
}
