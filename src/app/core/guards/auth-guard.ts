import { CanActivateFn, Router } from '@angular/router';
import { Token } from '../services/token';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const token = inject(Token);
  const router = inject(Router);

  if (token.getAccess()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
