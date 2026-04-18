import { Routes } from '@angular/router';
import { guestGuard, roleGuard, verifiedGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register').then((m) => m.Register),
      },
    ],
  },
  {
    path: 'auth/verify-email',
    loadComponent: () => import('./auth/verify-email/verify-email').then((m) => m.VerifyEmail),
  },

  // ── Authenticated shell (sidebar layout) ──────────────────────────────────
  {
    path: '',
    canActivate: [verifiedGuard],
    loadComponent: () => import('./features/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'dashboard',
        canActivate: [verifiedGuard],
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'profile',
        canActivate: [roleGuard(['customer'])],
        loadComponent: () => import('./features/customer/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'addresses',
        canActivate: [roleGuard(['customer'])],
        loadComponent: () =>
          import('./features/customer/addresses/addresses').then((m) => m.Addresses),
      },
    ],
  },

  // ── Fallback ─────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '/auth/login' },
];
