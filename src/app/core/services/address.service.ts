import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Address } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.base}/customer/addresses`);
  }

  createAddress(data: Partial<Address>): Observable<Address> {
    return this.http.post<Address>(`${this.base}/customer/addresses`, data);
  }

  updateAddress(id: number, data: Partial<Address>): Observable<Address> {
    return this.http.patch<Address>(`${this.base}/customer/addresses/${id}`, data);
  }

  setDefault(id: number): Observable<Address> {
    return this.http.patch<Address>(`${this.base}/customer/addresses/${id}/default`, {});
  }

  deleteAddress(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/customer/addresses/${id}`);
  }
}