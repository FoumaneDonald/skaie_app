import { HttpInterceptorFn } from '@angular/common/http';
import { Token } from '../services/token';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(Token);
  const authService = inject(Auth);

  const token = tokenService.getAccess();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // 🔁 Token expired → refresh
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((res) => {
            const newToken = res.access_token;

            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });

            return next(clonedReq);
          }),
        );
      }

      // 🚫 Email not verified
      if (error.status === 403 && error.error?.action === 'verify_email') {
        window.location.href = '/verify-email';
      }

      return throwError(() => error);
    }),
  );
};
