import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../core/models/auth.model';
import { AuthStateService } from '../../core/services/auth.state';
import { Auth } from '../../core/services/auth';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private authState = inject(AuthStateService);
  private authService = inject(Auth);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);

  user = signal<User | null>(null);
  orderCount = signal<number>(0);
  pendingOrders = signal<number>(0);
  totalSpent = signal<number>(0);

  ngOnInit(): void {
    this.user.set(this.authState.snapshot.user);
    this.authService.me().subscribe({ next: (u) => this.user.set(u) });

    // Charger les stats si customer
    if (this.authState.snapshot.user?.role === 'customer') {
      this.loadStats();
    }
  }

  private loadStats(): void {
    this.orderService.getOrders().subscribe({
      next: (res) => {
        this.orderCount.set(res.total);
        this.pendingOrders.set(res.data.filter((o) => o.status === 'pending').length);
      },
    });
    this.paymentService.getPaymentHistory().subscribe({
      next: (res) => {
        const total = res.data
          .filter((p) => p.status === 'succeeded')
          .reduce((sum, p) => sum + p.amount, 0);
        this.totalSpent.set(total);
      },
    });
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
  }

  get isCustomer() {
    return this.user()?.role === 'customer';
  }
  get isAdmin() {
    return this.user()?.role === 'admin' || this.user()?.role === 'super_admin';
  }
}
