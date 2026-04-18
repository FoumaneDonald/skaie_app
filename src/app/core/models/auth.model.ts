export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatar: string | null;
  date_of_birth: string | null;
  email_verified_at: string | null;
}

export interface AuthResponse {
  message: string;
  user: User;
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RefreshResponse {
  message: string;
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  action?: string;
}
