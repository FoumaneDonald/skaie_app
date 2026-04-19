import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product, ProductFilters } from '../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  readonly cart          = inject(CartService);

  products    = signal<Product[]>([]);
  loading     = signal(true);
  error       = signal<string | null>(null);
  addedId     = signal<number | null>(null);

  // Filtres
  search   = signal('');
  category = signal('');
  sort     = signal<'newest' | 'price_asc' | 'price_desc'>('newest');

  // Pagination
  currentPage = signal(1);
  lastPage    = signal(1);
  total       = signal(0);

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    const filters: ProductFilters = {
      page,
      per_page: 12,
      search:   this.search()   || undefined,
      category: this.category() || undefined,
      sort:     this.sort(),
    };

    this.productService.getProducts(filters).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.currentPage.set(res.current_page);
        this.lastPage.set(res.last_page);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des produits.');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.load(1);
  }

  reset(): void {
    this.search.set('');
    this.category.set('');
    this.sort.set('newest');
    this.load(1);
  }

  addToCart(product: Product): void {
    this.cart.add(product, 1);
    this.addedId.set(product.id);
    setTimeout(() => this.addedId.set(null), 1200);
  }

  prevPage(): void { if (this.currentPage() > 1) this.load(this.currentPage() - 1); }
  nextPage(): void { if (this.currentPage() < this.lastPage()) this.load(this.currentPage() + 1); }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
  }
}
