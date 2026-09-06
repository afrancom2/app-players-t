import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
}

interface PendingConfirm extends ConfirmRequest {
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly pendingSignal = signal<PendingConfirm | null>(null);

  readonly pending = this.pendingSignal.asReadonly();

  confirm(request: ConfirmRequest): Promise<boolean> {
    return new Promise((resolve) => {
      this.pendingSignal.set({ ...request, resolve });
    });
  }

  resolve(result: boolean): void {
    this.pendingSignal()?.resolve(result);
    this.pendingSignal.set(null);
  }
}
