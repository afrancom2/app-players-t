import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  kind: 'success' | 'error' | 'warning';
  title?: string;
  message: string;
  detail?: string;
}

export interface ToastOptions {
  title?: string;
  detail?: string;
}

const AUTO_DISMISS_MS: Record<Toast['kind'], number> = {
  success: 4000,
  warning: 6000,
  error: 7000,
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  private nextId = 1;

  readonly toasts = this.toastsSignal.asReadonly();

  success(message: string, options?: ToastOptions): void {
    this.push('success', message, options);
  }

  error(message: string, options?: ToastOptions): void {
    this.push('error', message, options);
  }

  warning(message: string, options?: ToastOptions): void {
    this.push('warning', message, options);
  }

  dismiss(id: number): void {
    this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  private push(kind: Toast['kind'], message: string, options?: ToastOptions): void {
    const id = this.nextId++;
    this.toastsSignal.update((toasts) => [
      ...toasts,
      { id, kind, message, title: options?.title, detail: options?.detail },
    ]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS[kind]);
  }
}
