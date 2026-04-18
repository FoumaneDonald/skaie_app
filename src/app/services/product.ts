import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product'; // Assure-toi que ce fichier existe

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // L'URL de ton backend Laravel
  private apiUrl = 'http://127.0.0.1:8000/api/products';

  constructor(private http: HttpClient) { }

  /**
   * READ : Récupérer la liste des produits
   * Note : Laravel paginate() renvoie un objet avec une propriété 'data'
   */
  getProducts(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  /**
   * CREATE : Ajouter un produit
   * C'est ici que la 'category' sera envoyée au backend
   */
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  /**
   * UPDATE : Modifier un produit existant
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  /**
   * DELETE : Supprimer un produit
   */
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}