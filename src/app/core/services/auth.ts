import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Token } from './token';
import { tap } from 'rxjs/operators';

const API = 'http://127.0.0.1:8000/api';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(
    private http: HttpClient,
    private token: Token,
  ) {}

  login(data: { email: string; password: string }) {
    return this.http.post<any>(`${API}/auth/login`, data).pipe(
      tap((res) => {
        this.token.setTokens(res.access_token, res.refresh_token);
      }),
    );
  }

  register(data: { name: string; email: string; password: string; confirmPassword: string }) {
    return this.http.post<any>(`${API}/auth/register`, data).pipe(
      tap((res) => {
        this.token.setTokens(res.access_token, res.refresh_token);
      }),
    );
  }

  logout() {
    return this.http.post(`${API}/auth/logout`, {}).pipe(tap(() => this.token.clear()));
  }

  me() {
    return this.http.get(`${API}/auth/me`);
  }

  refreshToken() {
    return this.http
      .post<any>(`${API}/auth/refresh`, {
        refresh_token: this.token.getRefresh(),
      })
      .pipe(
        tap((res) => {
          this.token.setTokens(res.access_token, res.refresh_token);
        }),
      );
  }
}
