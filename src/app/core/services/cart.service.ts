import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly KEY = 'skaie_cart';

  private _items = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();

  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));

  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  );

  add(product: Product, qty = 1): void {
    const current = this._items();
    const idx = current.findIndex((i) => i.product.id === product.id);
    if (idx >= 0) {
      const updated = current.map((item, i) =>
        i === idx ? { ...item, quantity: item.quantity + qty } : item
      );
      this.set(updated);
    } else {
      this.set([...current, { product, quantity: qty }]);
    }
  }

  remove(productId: number): void {
    this.set(this._items().filter((i) => i.product.id !== productId));
  }

  updateQty(productId: number, qty: number): void {
    if (qty <= 0) {
      this.remove(productId);
      return;
    }
    this.set(this._items().map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)));
  }

  clear(): void {
    this.set([]);
  }

  private set(items: CartItem[]): void {
    this._items.set(items);
    try {
      localStorage.setItem(this.KEY, JSON.stringify(items));
    } catch {}
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}