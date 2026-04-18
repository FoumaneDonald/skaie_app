import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Token } from './token';
import { catchError, tap } from 'rxjs/operators';
import { AuthResponse, RefreshResponse, User } from '../models/auth.model';
import { Observable, throwError } from 'rxjs';
import { AuthStateService } from './auth.state';
import { Router } from '@angular/router';

const API = 'http://127.0.0.1:8000/api';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private authState = inject(AuthStateService);
  private router = inject(Router);

  constructor(private token: Token) {}

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    this.authState.setLoading(true);
    return this.http.post<any>(`${API}/auth/login`, data).pipe(
      tap((res) => {
        this.authState.setAuthenticated(res.user, res.access_token, res.refresh_token);
      }),
    );
  }

  register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Observable<AuthResponse> {
    this.authState.setLoading(true);
    return this.http.post<AuthResponse>(`${API}/auth/register`, data).pipe(
      tap((res) => {
        this.authState.setAuthenticated(res.user, res.access_token, res.refresh_token);
      }),
      catchError((err) => {
        this.authState.setLoading(false);
        return throwError(() => err);
      }),
    );
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/auth/logout`, {}).pipe(
      tap(() => {
        this.authState.clearAuth();
        this.router.navigate(['/auth/login']);
      }),
      catchError((err) => {
        // Clear locally even if server call fails
        this.authState.clearAuth();
        this.router.navigate(['/auth/login']);
        return throwError(() => err);
      }),
    );
  }

  me(): Observable<User> {
    return this.http.get<User>(`${API}/auth/me`).pipe(tap((user) => this.authState.setUser(user)));
  }

  verifyEmail(otp: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${API}/auth/email/verify`, { otp })
      .pipe(tap(() => this.authState.setEmailVerified()));
  }

  resendOtp(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/auth/email/resend`, {});
  }

  refresh(): Observable<RefreshResponse> {
    const refreshToken = this.authState.snapshot.refreshToken;
    return this.http
      .post<RefreshResponse>(`${API}/auth/refresh`, { refresh_token: refreshToken })
      .pipe(
        tap((res) => {
          this.authState.updateTokens(res.access_token, res.refresh_token);
        }),
      );
  }
}
