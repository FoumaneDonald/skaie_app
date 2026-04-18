import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address, CreateAddressRequest, UpdateAddressRequest } from '../models/user.models';

const API = 'http://127.0.0.1:8000/api';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private readonly base = `${API}/customer/addresses`;

  getAll(): Observable<Address[]> {
    return this.http.get<Address[]>(this.base);
  }

  create(payload: CreateAddressRequest): Observable<{ message: string; address: Address }> {
    return this.http.post<{ message: string; address: Address }>(this.base, payload);
  }

  update(
    id: number,
    payload: UpdateAddressRequest,
  ): Observable<{ message: string; address: Address }> {
    return this.http.patch<{ message: string; address: Address }>(`${this.base}/${id}`, payload);
  }

  setDefault(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${id}/default`, {});
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
