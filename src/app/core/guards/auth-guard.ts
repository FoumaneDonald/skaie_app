import { CanActivateFn, Router } from '@angular/router';
import { Token } from '../services/token';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth.state';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  return authState.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        return router.createUrlTree(['/auth/login']);
      }
      return true;
    }),
  );
};

export const verifiedGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const state = authState.snapshot;

  if (!state.isAuthenticated) {
    return router.createUrlTree(['/auth/login']);
  }

  if (!state.isEmailVerified) {
    return router.createUrlTree(['/auth/verify-email']);
  }

  return true;
};

export const guestGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (authState.snapshot.isAuthenticated) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};

export const roleGuard =
  (allowedRoles: string[]): CanActivateFn =>
  () => {
    const authState = inject(AuthStateService);
    const router = inject(Router);

    const user = authState.snapshot.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return router.createUrlTree(['/unauthorized']);
    }

    return true;
  };
