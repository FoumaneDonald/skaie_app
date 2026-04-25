import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressService } from '../../core/services/address.service';
import { Address } from '../../core/models/payment.model';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addresses.html',
  styleUrl: './addresses.scss',
})
export class Addresses implements OnInit {
  private addressService = inject(AddressService);
  private fb = inject(FormBuilder);

  addresses = signal<Address[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editId = signal<number | null>(null);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form = this.fb.group({
    label:        ['Domicile', Validators.required],
    street_line_1:['', Validators.required],
    street_line_2:[''],
    city:         ['', Validators.required],
    state:        [''],
    zip:          [''],
    country:      ['CM'],
    phone:        [''],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.addressService.getAddresses().subscribe({
      next: (list) => { this.addresses.set(list); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  openAdd(): void { this.form.reset({ label: 'Domicile', country: 'CM' }); this.editId.set(null); this.showForm.set(true); }

  openEdit(a: Address): void {
    this.editId.set(a.id);
    this.form.patchValue({ label: a.label, street_line_1: a.street_line_1, street_line_2: a.street_line_2 ?? '', city: a.city, state: a.state ?? '', zip: a.zip ?? '', country: a.country, phone: a.phone ?? '' });
    this.showForm.set(true);
  }

  cancel(): void { this.showForm.set(false); this.editId.set(null); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    const data = this.form.value as Partial<Address>;
    const op = this.editId()
      ? this.addressService.updateAddress(this.editId()!, data)
      : this.addressService.createAddress(data);
    op.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); this.success.set('Adresse enregistrée.'); setTimeout(() => this.success.set(null), 3000); },
      error: (err) => { this.error.set(err.error?.message ?? 'Erreur.'); this.saving.set(false); },
    });
  }

  setDefault(id: number): void {
    this.addressService.setDefault(id).subscribe({ next: () => this.load() });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette adresse ?')) return;
    this.addressService.deleteAddress(id).subscribe({ next: () => this.load() });
  }
}