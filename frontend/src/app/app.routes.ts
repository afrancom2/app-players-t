import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'jugadores' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'jugadores',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/players/player-list/player-list').then((m) => m.PlayerList),
  },
  {
    path: 'jugadores/nuevo',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/players/player-form/player-form').then((m) => m.PlayerForm),
  },
  {
    path: 'jugadores/:id/editar',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/players/player-form/player-form').then((m) => m.PlayerForm),
  },
  {
    path: 'jugadores/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/players/player-detail/player-detail').then((m) => m.PlayerDetail),
  },
  { path: '**', redirectTo: 'jugadores' },
];
