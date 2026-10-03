import { Component, inject, signal } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [],
  template: `
    <div class="toast-stack">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast-error]="toast.kind === 'error'"
          [class.toast-warning]="toast.kind === 'warning'"
        >
          <button type="button" class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Cerrar">
            ✕
          </button>
          @if (toast.title) {
            <span class="toast-title">{{ toast.title }}</span>
          }
          <span class="toast-message">{{ toast.message }}</span>
          @if (toast.detail) {
            <button type="button" class="toast-detail-toggle" (click)="toggleDetail(toast.id)">
              {{ expanded().has(toast.id) ? 'Ocultar detalle técnico' : 'Ver detalle técnico' }}
            </button>
            @if (expanded().has(toast.id)) {
              <pre class="toast-detail mono">{{ toast.detail }}</pre>
            }
          }
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
        max-width: 360px;
      }
      .toast {
        position: relative;
        /* Fondo oscuro fijo (no usa var(--ink)): ese token se invierte en modo
           claro/oscuro, y dejaba texto blanco sobre un fondo casi blanco. */
        background: #1b2018;
        color: #f5f3ec;
        padding: 12px 30px 12px 18px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: var(--shadow);
        border-left: 4px solid var(--accent);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .toast-warning {
        border-left-color: #d6a93b;
      }
      .toast-error {
        border-left-color: var(--bad);
      }
      .toast-title {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10.5px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.75;
        font-weight: 700;
      }
      .toast-message {
        font-weight: 600;
        line-height: 1.35;
      }
      .toast-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1;
        padding: 2px;
      }
      .toast-close:hover {
        color: #fff;
      }
      .toast-detail-toggle {
        align-self: flex-start;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.75);
        font-size: 11.5px;
        font-weight: 600;
        text-decoration: underline;
        padding: 2px 0;
      }
      .toast-detail-toggle:hover {
        color: #fff;
      }
      .toast-detail {
        white-space: pre-wrap;
        font-size: 11px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        padding: 8px;
        margin: 0;
        max-height: 160px;
        overflow-y: auto;
      }
    `,
  ],
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
  protected readonly expanded = signal<Set<number>>(new Set());

  protected toggleDetail(id: number): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
}
