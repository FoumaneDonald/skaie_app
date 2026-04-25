import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { AuthStateService } from '../../core/services/auth.state';
import { Payment } from '../../core/models/payment.model';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.scss',
})
export class PaymentHistory implements OnInit {
  private paymentService = inject(PaymentService);
  private authState      = inject(AuthStateService);

  payments     = signal<Payment[]>([]);
  loading      = signal(true);
  error        = signal<string | null>(null);
  filterStatus = signal<string>('');
  refunding    = signal<number | null>(null);
  flashMsg     = signal<string | null>(null);
  flashType    = signal<'success' | 'error'>('success');

  isAdmin = computed(() => {
    const role = this.authState.snapshot.user?.role;
    return role === 'admin' || role === 'super_admin';
  });

  totalSucceeded = computed(() =>
    this.payments().filter((p) => p.status === 'succeeded').reduce((s, p) => s + p.amount, 0)
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const req = this.isAdmin()
      ? this.paymentService.adminGetPayments(this.filterStatus() || undefined)
      : this.paymentService.getPaymentHistory();

    req.subscribe({
      next: (res) => { this.payments.set(res.data); this.loading.set(false); },
      error: ()  => { this.error.set('Erreur de chargement.'); this.loading.set(false); },
    });
  }

  refund(payment: Payment): void {
    if (!confirm(`Rembourser le paiement #${payment.id} de ${this.formatPrice(payment.amount, payment.currency)} ?`)) return;
    this.refunding.set(payment.id);

    this.paymentService.adminRefund(payment.id).subscribe({
      next: (res) => {
        this.payments.update((list) =>
          list.map((p) => (p.id === payment.id ? { ...p, status: 'refunded' } : p))
        );
        this.refunding.set(null);
        this.showFlash(res.message, 'success');
      },
      error: (err) => {
        this.refunding.set(null);
        this.showFlash(err.error?.message ?? 'Erreur lors du remboursement.', 'error');
      },
    });
  }

  private showFlash(msg: string, type: 'success' | 'error'): void {
    this.flashMsg.set(msg);
    this.flashType.set(type);
    setTimeout(() => this.flashMsg.set(null), 4000);
  }

  countByStatus(status: string): number {
    return this.payments().filter((p) => p.status === status).length;
  }

  formatPrice(n: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency.toUpperCase() }).format(n);
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      pending: 'En attente', succeeded: 'Réussi', failed: 'Échoué',
      cancelled: 'Annulé',   refunded: 'Remboursé', processing: 'En cours',
    };
    return m[s] ?? s;
  }
}
