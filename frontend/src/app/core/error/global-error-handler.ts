import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { ToastService } from '../../shared/ui/toast/toast.service';

/**
 * Captura errores que no pasan por el interceptor HTTP: bugs de plantilla,
 * excepciones síncronas, promesas no manejadas, etc. Sin esto, un error así
 * hoy no muestra nada al usuario — la pantalla simplemente queda rota o vacía
 * en silencio.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly zone = inject(NgZone);
  private readonly toast = inject(ToastService);

  handleError(error: unknown): void {
    // Siempre queda en la consola del navegador para quien necesite el stack.
    console.error(error);

    const detail = error instanceof Error ? (error.stack ?? error.message) : String(error);

    this.zone.run(() => {
      this.toast.error('Ocurrió un error inesperado en la aplicación. Intenta recargar la página.', {
        title: 'Aplicación (frontend)',
        detail,
      });
    });
  }
}
