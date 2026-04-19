import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InitiatePaymentResponse,
  Payment,
  PaymentStatus,
  PaymentsResponse,
  PaymentStatusResponse,
} from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // Customer
  initiatePayment(orderId: number): Observable<InitiatePaymentResponse> {
    return this.http.post<InitiatePaymentResponse>(
      `${this.base}/customer/orders/${orderId}/payment`,
      {}
    );
  }

  getPaymentStatus(orderId: number): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(
      `${this.base}/customer/orders/${orderId}/payment/status`
    );
  }

  getPaymentHistory(): Observable<PaymentsResponse> {
    return this.http.get<PaymentsResponse>(`${this.base}/customer/payments`);
  }

  // Admin
  adminGetPayments(status?: string): Observable<PaymentsResponse> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<PaymentsResponse>(`${this.base}/admin/payments`, { params });
  }

  adminRefund(paymentId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.base}/admin/payments/${paymentId}/refund`,
      {}
    );
  }
}