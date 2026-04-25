import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.scss',
})
export class PaymentResult implements OnInit {
  private route = inject(ActivatedRoute);

  status = signal<'success' | 'failed' | 'pending' | null>(null);
  orderId = signal<string | null>(null);
  reason = signal<string | null>(null);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.orderId.set(params['order_id'] ?? null);
    this.reason.set(params['reason'] ?? null);

    const s = params['status'];
    if (s === 'success' || s === 'failed' || s === 'pending') {
      this.status.set(s);
    } else {
      this.status.set('pending');
    }
  }
}