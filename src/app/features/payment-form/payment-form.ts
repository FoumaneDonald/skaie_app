import { Component, inject, signal, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../core/services/payment.service';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { InitiatePaymentResponse } from '../../core/models/payment.model';
import { environment } from '../../../environments/environment';

declare var Stripe: any;

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.scss',
})
export class PaymentForm implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardElement') cardElementRef!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private orderService = inject(OrderService);

  orderId = signal<number | null>(null);
  order = signal<Order | null>(null);
  paymentData = signal<InitiatePaymentResponse | null>(null);

  step = signal<'loading' | 'ready' | 'processing' | 'error'>('loading');
  errorMessage = signal<string | null>(null);
  cardError = signal<string | null>(null);

  private stripe: any = null;
  private elements: any = null;
  private cardElement: any = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('orderId'));
    this.orderId.set(id);
    this.loadOrder(id);
  }

  ngAfterViewInit(): void {}

  private loadOrder(id: number): void {
    this.orderService.getOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.initiatePayment(id);
      },
      error: () => {
        this.step.set('error');
        this.errorMessage.set('Commande introuvable.');
      },
    });
  }

  private initiatePayment(orderId: number): void {
    this.paymentService.initiatePayment(orderId).subscribe({
      next: (data) => {
        this.paymentData.set(data);
        this.loadStripe(data.client_secret);
      },
      error: (err) => {
        this.step.set('error');
        this.errorMessage.set(err.error?.message ?? 'Impossible d\'initier le paiement.');
      },
    });
  }

  private loadStripe(clientSecret: string): void {
    if (typeof Stripe !== 'undefined') {
      this.initStripeElements(clientSecret);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => this.initStripeElements(clientSecret);
    script.onerror = () => {
      this.step.set('error');
      this.errorMessage.set('Impossible de charger Stripe.js.');
    };
    document.head.appendChild(script);
  }

  private initStripeElements(clientSecret: string): void {
    this.stripe = Stripe(environment.stripePublicKey);
    this.elements = this.stripe.elements({ clientSecret });

    const appearance = {
      theme: 'night',
      variables: {
        colorPrimary: '#6c63ff',
        colorBackground: '#1a1a2a',
        colorText: '#f0f0f5',
        colorDanger: '#ef4444',
        fontFamily: '"Inter", system-ui, sans-serif',
        borderRadius: '8px',
      },
    };

    const paymentElement = this.elements.create('payment', { appearance });
    paymentElement.mount('#stripe-payment-element');

    paymentElement.on('change', (event: any) => {
      this.cardError.set(event.error ? event.error.message : null);
    });

    this.cardElement = paymentElement;
    this.step.set('ready');
  }

  async submitPayment(): Promise<void> {
    if (!this.stripe || !this.elements || this.step() !== 'ready') return;

    this.step.set('processing');
    this.errorMessage.set(null);
    this.cardError.set(null);

    const returnUrl = `${window.location.origin}/payment-result?order_id=${this.orderId()}`;

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    });

    if (error) {
      this.step.set('ready');
      this.cardError.set(error.message ?? 'Paiement refusé.');
    } else {
      this.pollPaymentStatus();
    }
  }

  private pollPaymentStatus(attempts = 0): void {
    if (attempts > 10) {
      this.router.navigate(['/payment-result'], {
        queryParams: { order_id: this.orderId(), status: 'pending' },
      });
      return;
    }

    setTimeout(() => {
      this.paymentService.getPaymentStatus(this.orderId()!).subscribe({
        next: (status) => {
          if (status.payment_status === 'succeeded') {
            this.router.navigate(['/payment-result'], {
              queryParams: { order_id: this.orderId(), status: 'success' },
            });
          } else if (status.payment_status === 'failed' || status.payment_status === 'cancelled') {
            this.router.navigate(['/payment-result'], {
              queryParams: { order_id: this.orderId(), status: 'failed', reason: status.failure_message },
            });
          } else {
            this.pollPaymentStatus(attempts + 1);
          }
        },
        error: () => this.pollPaymentStatus(attempts + 1),
      });
    }, 2000);
  }

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  ngOnDestroy(): void {
    this.cardElement?.destroy();
  }
}
