import { Component, inject, OnInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { environment } from '../../../environments/environment';

declare var Stripe: any;

@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-payment.html',
  styleUrl: './checkout-payment.scss',
})
export class CheckoutPayment implements OnInit, OnDestroy {
  @ViewChild('cardElement', { static: false }) cardElementRef!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);

  orderId = signal<number>(0);
  amount = signal<number>(0);
  currency = signal<string>('eur');
  clientSecret = signal<string>('');

  loading = signal(true);
  paying = signal(false);
  error = signal<string | null>(null);
  cardError = signal<string | null>(null);

  private stripe: any = null;
  private card: any = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('orderId'));
    if (!id) {
      this.router.navigate(['/orders']);
      return;
    }
    this.orderId.set(id);
    this.initPayment(id);
  }

  private initPayment(orderId: number): void {
    this.loading.set(true);
    this.paymentService.initiatePayment(orderId).subscribe({
      next: (res) => {
        this.clientSecret.set(res.client_secret);
        this.amount.set(res.amount);
        this.currency.set(res.currency);
        this.loading.set(false);
        // Mount Stripe Elements after view updates
        setTimeout(() => this.mountStripe(), 100);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Impossible d\'initialiser le paiement.');
        this.loading.set(false);
      },
    });
  }

  private mountStripe(): void {
    if (typeof Stripe === 'undefined') {
      this.error.set('Stripe.js non chargé. Vérifiez votre connexion internet.');
      return;
    }

    this.stripe = Stripe(environment.stripePublicKey);
    const elements = this.stripe.elements();

    this.card = elements.create('card', {
      style: {
        base: {
          color: '#f0f0f5',
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontSize: '15px',
          fontSmoothing: 'antialiased',
          '::placeholder': { color: '#555568' },
        },
        invalid: { color: '#f87171', iconColor: '#f87171' },
      },
    });

    if (this.cardElementRef) {
      this.card.mount(this.cardElementRef.nativeElement);
      this.card.on('change', (event: any) => {
        this.cardError.set(event.error ? event.error.message : null);
      });
    }
  }

  async pay(): Promise<void> {
    if (!this.stripe || !this.card) return;

    this.paying.set(true);
    this.error.set(null);

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret(), {
      payment_method: { card: this.card },
    });

    if (error) {
      this.error.set(error.message ?? 'Le paiement a échoué.');
      this.paying.set(false);
    } else if (paymentIntent?.status === 'succeeded') {
      // Poll to confirm backend has updated
      this.pollStatus();
    } else {
      this.error.set('Statut inattendu du paiement. Vérifiez vos commandes.');
      this.paying.set(false);
    }
  }

  private pollStatus(attempt = 0): void {
    if (attempt > 5) {
      // Navigate to success anyway after 5 attempts
      this.router.navigate(['/checkout/success', this.orderId()]);
      return;
    }

    setTimeout(() => {
      this.paymentService.getPaymentStatus(this.orderId()).subscribe({
        next: (res) => {
          if (res.payment_status === 'succeeded') {
            this.router.navigate(['/checkout/success', this.orderId()]);
          } else if (res.payment_status === 'failed') {
            this.error.set('Paiement refusé : ' + (res.failure_message ?? 'raison inconnue'));
            this.paying.set(false);
          } else {
            this.pollStatus(attempt + 1);
          }
        },
        error: () => this.pollStatus(attempt + 1),
      });
    }, 1500);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: this.currency().toUpperCase(),
    }).format(price);
  }

  ngOnDestroy(): void {
    if (this.card) {
      this.card.destroy();
    }
  }
}