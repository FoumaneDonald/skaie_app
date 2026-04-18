import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/auth.model';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  isEmailVerified: false,
};

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly STORAGE_KEY = 'skaie_auth';

  private _state = new BehaviorSubject<AuthState>(this.loadFromStorage());

  // Public observables
  readonly state$: Observable<AuthState> = this._state.asObservable();
  readonly user$ = new BehaviorSubject<User | null>(this._state.value.user);
  readonly isAuthenticated$ = new BehaviorSubject<boolean>(this._state.value.isAuthenticated);
  readonly isEmailVerified$ = new BehaviorSubject<boolean>(this._state.value.isEmailVerified);

  get snapshot(): AuthState {
    return this._state.value;
  }

  get accessToken(): string | null {
    return this._state.value.accessToken;
  }

  setAuthenticated(user: User, accessToken: string, refreshToken: string): void {
    const newState: AuthState = {
      user,
      accessToken,
      refreshToken,
      isLoading: false,
      isAuthenticated: true,
      isEmailVerified: !!user.email_verified_at,
    };
    this.updateState(newState);
    this.persistToStorage(newState);
  }

  setUser(user: User): void {
    const newState = {
      ...this._state.value,
      user,
      isEmailVerified: !!user.email_verified_at,
    };
    this.updateState(newState);
    this.persistToStorage(newState);
  }

  updateTokens(accessToken: string, refreshToken: string): void {
    const newState = { ...this._state.value, accessToken, refreshToken };
    this.updateState(newState);
    this.persistToStorage(newState);
  }

  setEmailVerified(): void {
    const user = this._state.value.user;
    if (user) {
      const updatedUser = { ...user, email_verified_at: new Date().toISOString() };
      const newState = { ...this._state.value, user: updatedUser, isEmailVerified: true };
      this.updateState(newState);
      this.persistToStorage(newState);
    }
  }

  setLoading(isLoading: boolean): void {
    this.updateState({ ...this._state.value, isLoading });
  }

  clearAuth(): void {
    this.updateState(initialState);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private updateState(state: AuthState): void {
    this._state.next(state);
    this.user$.next(state.user);
    this.isAuthenticated$.next(state.isAuthenticated);
    this.isEmailVerified$.next(state.isEmailVerified);
  }

  private persistToStorage(state: AuthState): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        }),
      );
    } catch {
      // Storage unavailable
    }
  }

  private loadFromStorage(): AuthState {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return initialState;
      const { user, accessToken, refreshToken } = JSON.parse(raw);

      console.log('Checking storage on refresh:', {
        hasUser: !!user,
        email_verified_at: user?.email_verified_at,
      });
      if (!user || !accessToken) return initialState;
      return {
        user,
        accessToken,
        refreshToken,
        isLoading: false,
        isAuthenticated: true,
        isEmailVerified: !!user.email_verified_at,
      };
    } catch {
      return initialState;
    }
  }
}
