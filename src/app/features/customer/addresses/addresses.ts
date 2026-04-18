import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address } from '../../../core/models/user.models';
import { AddressService } from '../../../core/services/address';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-addresses',
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './addresses.html',
  styleUrl: './addresses.scss',
})
export class Addresses implements OnInit {
  private fb = inject(FormBuilder);
  private addressService = inject(AddressService);

  addresses = signal<Address[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  isSaving = signal(false);
  isDeleting = signal<number | null>(null);
  isSettingDefault = signal<number | null>(null);
  formError = signal<string | null>(null);
  formFieldErrors = signal<Record<string, string>>({});

  form = this.fb.group({
    label: [''],
    street_line_1: ['', Validators.required],
    street_line_2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zip: ['', Validators.required],
    country: ['', Validators.required],
    phone: ['', Validators.required],
    is_default: [false],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.addressService.getAll().subscribe({
      next: (list) => {
        this.addresses.set(list);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ is_default: false });
    this.formError.set(null);
    this.formFieldErrors.set({});
    this.showForm.set(true);
  }

  openEdit(address: Address): void {
    this.editingId.set(address.id);
    this.form.patchValue({
      label: address.label ?? '',
      street_line_1: address.street_line_1,
      street_line_2: address.street_line_2 ?? '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      phone: address.phone,
      is_default: address.is_default,
    });
    this.formError.set(null);
    this.formFieldErrors.set({});
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.formError.set(null);
    this.formFieldErrors.set({});

    const payload = {
      label: this.form.value.label || undefined,
      street_line_1: this.form.value.street_line_1!,
      street_line_2: this.form.value.street_line_2 || undefined,
      city: this.form.value.city!,
      state: this.form.value.state!,
      zip: this.form.value.zip!,
      country: this.form.value.country!,
      phone: this.form.value.phone!,
      is_default: this.form.value.is_default ?? false,
    };

    const req$ = this.editingId()
      ? this.addressService.update(this.editingId()!, payload)
      : this.addressService.create(payload);

    req$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeForm();
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        if (err.error?.errors) {
          const mapped: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(err.error.errors)) {
            mapped[key] = (msgs as string[])[0];
          }
          this.formFieldErrors.set(mapped);
        } else {
          this.formError.set(err.error?.message ?? 'Failed to save address.');
        }
      },
    });
  }

  setDefault(address: Address): void {
    if (address.is_default) return;
    this.isSettingDefault.set(address.id);
    this.addressService.setDefault(address.id).subscribe({
      next: () => {
        this.isSettingDefault.set(null);
        this.load();
      },
      error: () => this.isSettingDefault.set(null),
    });
  }

  delete(address: Address): void {
    if (address.is_default) return;
    this.isDeleting.set(address.id);
    this.addressService.delete(address.id).subscribe({
      next: () => {
        this.isDeleting.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.isDeleting.set(null);
        this.formError.set(err.error?.message ?? 'Failed to delete address.');
      },
    });
  }

  getError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.touched) return null;
    if (this.formFieldErrors()[field]) return this.formFieldErrors()[field];
    if (control.hasError('required')) return 'This field is required.';
    return null;
  }
}
