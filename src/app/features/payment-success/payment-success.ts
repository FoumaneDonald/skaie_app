import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { PaymentStatusResponse } from '../../core/models/payment.model';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.scss',
})
export class PaymentSuccess implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);

  orderId = signal<number>(0);
  status = signal<PaymentStatusResponse | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('orderId'));
    this.orderId.set(id);
    if (id) {
      this.paymentService.getPaymentStatus(id).subscribe({
        next: (s) => this.status.set(s),
      });
    }
  }

  formatPrice(n: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(n);
  }
}