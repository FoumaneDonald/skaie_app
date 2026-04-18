import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { HttpErrorResponse } from '@angular/common/http';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('password_confirmation')?.value;
  return password === confirmation ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private authService = inject(Auth);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  showPassword = signal(false);

  signupForm = this.formBuilder.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
    },
    {
      validators: [passwordMatchValidator],
    },
  );

  async onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    const { name, email, password, password_confirmation } = this.signupForm.value;

    this.authService
      .register({
        name: name!,
        email: email!,
        password: password!,
        password_confirmation: password_confirmation!,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/auth/verify-email']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          if (err.error?.errors) {
            const mapped: Record<string, string> = {};
            for (const [key, msgs] of Object.entries(err.error.errors)) {
              mapped[key] = (msgs as string[])[0];
            }
            this.fieldErrors.set(mapped);
          } else {
            this.errorMessage.set(err.error?.message ?? 'Registration failed. Please try again.');
          }
        },
      });
  }

  getError(field: string): string | null {
    const control = this.signupForm.get(field);
    if (!control?.touched) return null;
    if (this.fieldErrors()[field]) return this.fieldErrors()[field];
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('minlength')) {
      const min = control.errors?.['minlength']?.requiredLength;
      return `Minimum ${min} characters required.`;
    }
    return null;
  }

  get passwordMismatch(): boolean {
    return (
      this.signupForm.hasError('passwordMismatch') &&
      !!this.signupForm.get('password_confirmation')?.touched
    );
  }
}
