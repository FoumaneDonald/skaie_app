import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOrderRequest, Order, OrdersResponse } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // Customer
  getOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.base}/customer/orders`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/customer/orders/${id}`);
  }

  createOrder(body: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.base}/customer/orders`, body);
  }

  cancelOrder(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/customer/orders/${id}/cancel`);
  }

  // Admin
  adminGetOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.base}/admin/orders`);
  }

  adminGetOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/admin/orders/${id}`);
  }

  adminUpdateStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/admin/orders/${id}/status`, { status });
  }
}