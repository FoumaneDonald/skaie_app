import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Token } from '../services/token';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { AuthStateService } from '../services/auth.state';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const token = authState.accessToken;
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token expired — attempt silent refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return handle401(req, next, authState, authService, router);
      }

      // Email not verified — redirect to verify screen
      if (error.status === 403 && error.error?.action === 'verify_email') {
        router.navigate(['/auth/verify-email']);
        return throwError(() => error);
      }

      return throwError(() => error);
    }),
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authState: AuthStateService,
  authService: Auth,
  router: Router,
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    return authService.refresh().pipe(
      switchMap((res) => {
        isRefreshing = false;
        refreshSubject.next(res.access_token);
        return next(addToken(req, res.access_token));
      }),
      catchError((err) => {
        isRefreshing = false;
        authState.clearAuth();
        router.navigate(['/auth/login']);
        return throwError(() => err);
      }),
    );
  }

  // Queue other requests while refreshing
  return refreshSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) => next(addToken(req, token!))),
  );
}
