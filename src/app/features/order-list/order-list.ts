import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { AuthStateService } from '../../core/services/auth.state';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderList implements OnInit {
  private orderService = inject(OrderService);
  private authState   = inject(AuthStateService);

  orders  = signal<Order[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);
  cancellingId = signal<number | null>(null);

  // Filtre statut
  filterStatus = signal<string>('');

  isAdmin = computed(() => {
    const role = this.authState.snapshot.user?.role;
    return role === 'admin' || role === 'super_admin';
  });

  filteredOrders = computed(() => {
    const s = this.filterStatus();
    if (!s) return this.orders();
    return this.orders().filter((o) => o.status === s);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const req = this.isAdmin()
      ? this.orderService.adminGetOrders()
      : this.orderService.getOrders();

    req.subscribe({
      next: (res) => { this.orders.set(res.data); this.loading.set(false); },
      error: ()  => { this.error.set('Erreur de chargement des commandes.'); this.loading.set(false); },
    });
  }

  cancel(order: Order): void {
    if (!confirm(`Annuler la commande #${order.id} ?`)) return;
    this.cancellingId.set(order.id);

    this.orderService.cancelOrder(order.id).subscribe({
      next: () => {
        this.orders.update((list) =>
          list.map((o) => (o.id === order.id ? { ...o, status: 'cancelled' as OrderStatus } : o))
        );
        this.cancellingId.set(null);
      },
      error: () => this.cancellingId.set(null),
    });
  }

  updateAdminStatus(order: Order, status: string): void {
    this.orderService.adminUpdateStatus(order.id, status).subscribe({
      next: (updated) => {
        this.orders.update((list) =>
          list.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o))
        );
      },
    });
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      pending: 'En attente', processing: 'En traitement',
      shipped: 'Expédiée',   delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return map[s] ?? s;
  }
}
