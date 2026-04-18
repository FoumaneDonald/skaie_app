import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthStateService } from './auth.state';
import { User } from '../models/auth.model';
import { UpdateProfileRequest, ChangePasswordRequest } from '../models/user.models';

const API = 'http://127.0.0.1:8000/api';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private authState = inject(AuthStateService);

  private readonly base = `${API}/customer`;

  getProfile(): Observable<User> {
    return this.http
      .get<User>(`${this.base}/profile`)
      .pipe(tap((user) => this.authState.setUser(user)));
  }

  updateProfile(payload: UpdateProfileRequest): Observable<{ message: string; user: User }> {
    return this.http
      .patch<{ message: string; user: User }>(`${this.base}/profile`, payload)
      .pipe(tap((res) => this.authState.setUser(res.user)));
  }

  changePassword(payload: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/profile/password`, payload);
  }

  deleteAccount(password: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/profile`, {
      body: { password },
    });
  }
}
