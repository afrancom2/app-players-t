import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  if (authService.isAdmin()) {
    return true;
  }
  return inject(Router).createUrlTree(['/jugadores']);
};
