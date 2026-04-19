import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/auth.model';

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  pending_orders: number;
  revenue_today: number;
  orders_today: number;
}

export interface RevenueSummary {
  period: string;
  revenue: number;
  orders: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/admin/dashboard`);
  }

  getRevenueSummary(): Observable<RevenueSummary[]> {
    return this.http.get<RevenueSummary[]>(`${this.base}/admin/dashboard/revenue-summary`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/admin/users`);
  }
}