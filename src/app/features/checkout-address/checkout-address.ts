import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AddressService } from '../../core/services/address.service';
import { Address } from '../../core/models/payment.model';

@Component({
  selector: 'app-checkout-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout-address.html',
  styleUrl: './checkout-address.scss',
})
export class CheckoutAddress implements OnInit {
  private fb = inject(FormBuilder);
  private cart = inject(CartService);
  private orderService = inject(OrderService);
  private addressService = inject(AddressService);
  private router = inject(Router);

  addresses = signal<Address[]>([]);
  selectedAddressId = signal<number | null>(null);
  useNewAddress = signal(false);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    label:   ['Domicile', Validators.required],
    street:  ['', Validators.required],
    city:    ['', Validators.required],
    state:   [''],
    zip:     [''],
    country: ['CM'],
    phone:   [''],
  });

  ngOnInit(): void {
    if (this.cart.items().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading.set(true);
    this.addressService.getAddresses().subscribe({
      next: (list) => {
        this.addresses.set(list);
        const def = list.find((a) => a.is_default);
        if (def) this.selectedAddressId.set(def.id);
        if (list.length === 0) this.useNewAddress.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.useNewAddress.set(true);
        this.loading.set(false);
      },
    });
  }

  selectAddress(id: number): void {
    this.selectedAddressId.set(id);
    this.useNewAddress.set(false);
  }

  toggleNewAddress(): void {
    this.useNewAddress.set(true);
    this.selectedAddressId.set(null);
  }

  submit(): void {
    if (this.useNewAddress() && this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const items = this.cart.items().map((i) => ({
      product_id: i.product.id,
      quantity: i.quantity,
    }));

    const body: any = { items };

    if (this.useNewAddress()) {
      body.address_data = this.form.value;
    } else {
      body.address_id = this.selectedAddressId();
    }

    this.orderService.createOrder(body).subscribe({
      next: (order) => {
        this.cart.clear();
        this.router.navigate(['/checkout/payment', order.id]);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors de la création de la commande.');
        this.submitting.set(false);
      },
    });
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
  }

  get cartTotal() { return this.cart.total(); }
  get cartCount() { return this.cart.count(); }
}