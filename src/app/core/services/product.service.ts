import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductFilters, ProductsResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getProducts(filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.price_min != null) params = params.set('price_min', filters.price_min);
    if (filters.price_max != null) params = params.set('price_max', filters.price_max);
    if (filters.sort) params = params.set('sort', filters.sort);
    if (filters.per_page) params = params.set('per_page', filters.per_page);
    if (filters.page) params = params.set('page', filters.page);
    return this.http.get<ProductsResponse>(`${this.base}/customer/products`, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/customer/products/${id}`);
  }

  // Admin CRUD
  adminGetProducts(filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.per_page) params = params.set('per_page', filters.per_page);
    return this.http.get<ProductsResponse>(`${this.base}/customer/products`, { params });
  }

  createProduct(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.base}/customer/products`, data);
  }

  updateProduct(id: number, data: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.base}/customer/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/customer/products/${id}`);
  }
}