import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { classifyHttpError } from './classified-error';

// La pantalla de login ya muestra su propio mensaje en línea; evitamos
// duplicar el aviso con un toast además del mensaje bajo el formulario.
function isLoginRequest(url: string): boolean {
  return url.includes('/auth/login');
}

// Una sesión expirada suele disparar varias peticiones en paralelo (ej. la
// pantalla de jugadores pide catálogos y jugadores a la vez); todas fallan
// con 401 casi al mismo tiempo. Esta bandera evita mostrar un toast y
// redirigir una vez por cada una — solo la primera cuenta, y se reinicia
// después de que el usuario vuelve a loguearse (nuevo ciclo de peticiones).
let sessionExpiredInFlight = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      const classified = classifyHttpError(err);

      if (isLoginRequest(req.url)) {
        return throwError(() => classified);
      }

      if (classified.status === 401) {
        if (sessionExpiredInFlight) {
          return throwError(() => classified);
        }
        sessionExpiredInFlight = true;
        authService.logout();
        toast.error(classified.message, { title: classified.title, detail: classified.detail });
        void router.navigate(['/login']).finally(() => {
          sessionExpiredInFlight = false;
        });
        return throwError(() => classified);
      }

      toast.error(classified.message, { title: classified.title, detail: classified.detail });

      return throwError(() => classified);
    }),
  );
};
