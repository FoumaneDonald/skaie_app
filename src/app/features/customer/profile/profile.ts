import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { User } from '../../../core/models/auth.model';
import { AuthStateService } from '../../../core/services/auth.state';
import { ProfileService } from '../../../core/services/profile';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private authState = inject(AuthStateService);

  user = signal<User | null>(null);
  isLoadingProfile = signal(true);

  // Profile form state
  isSavingProfile = signal(false);
  profileSuccess = signal<string | null>(null);
  profileError = signal<string | null>(null);
  profileFieldErrors = signal<Record<string, string>>({});

  // Password form state
  isSavingPassword = signal(false);
  passwordSuccess = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  showCurrentPw = signal(false);
  showNewPw = signal(false);

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    date_of_birth: [''],
  });

  passwordForm = this.fb.group({
    current_password: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.isLoadingProfile.set(false);
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone ?? '',
          date_of_birth: user.date_of_birth ?? '',
        });
      },
      error: () => this.isLoadingProfile.set(false),
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile.set(true);
    this.profileSuccess.set(null);
    this.profileError.set(null);
    this.profileFieldErrors.set({});

    const { name, email, phone, date_of_birth } = this.profileForm.value;

    this.profileService
      .updateProfile({
        name: name ?? undefined,
        email: email ?? undefined,
        phone: phone || undefined,
        date_of_birth: date_of_birth || undefined,
      })
      .subscribe({
        next: (res) => {
          this.isSavingProfile.set(false);
          this.user.set(res.user);
          this.profileSuccess.set('Profile updated successfully.');
          setTimeout(() => this.profileSuccess.set(null), 4000);
        },
        error: (err: HttpErrorResponse) => {
          this.isSavingProfile.set(false);
          if (err.error?.errors) {
            const mapped: Record<string, string> = {};
            for (const [key, msgs] of Object.entries(err.error.errors)) {
              mapped[key] = (msgs as string[])[0];
            }
            this.profileFieldErrors.set(mapped);
          } else {
            this.profileError.set(err.error?.message ?? 'Failed to update profile.');
          }
        },
      });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { password, password_confirmation } = this.passwordForm.value;
    if (password !== password_confirmation) {
      this.passwordError.set('Passwords do not match.');
      return;
    }

    this.isSavingPassword.set(true);
    this.passwordSuccess.set(null);
    this.passwordError.set(null);

    this.profileService
      .changePassword({
        current_password: this.passwordForm.value.current_password!,
        password: password!,
        password_confirmation: password_confirmation!,
      })
      .subscribe({
        next: () => {
          this.isSavingPassword.set(false);
          this.passwordForm.reset();
          this.passwordSuccess.set('Password changed successfully.');
          setTimeout(() => this.passwordSuccess.set(null), 4000);
        },
        error: (err: HttpErrorResponse) => {
          this.isSavingPassword.set(false);
          this.passwordError.set(err.error?.message ?? 'Failed to change password.');
        },
      });
  }

  getProfileError(field: string): string | null {
    const control = this.profileForm.get(field);
    if (!control?.touched) return null;
    if (this.profileFieldErrors()[field]) return this.profileFieldErrors()[field];
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('minlength'))
      return `Minimum ${control.errors?.['minlength']?.requiredLength} characters.`;
    return null;
  }

  getPasswordError(field: string): string | null {
    const control = this.passwordForm.get(field);
    if (!control?.touched) return null;
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('minlength')) return 'Password must be at least 8 characters.';
    return null;
  }
}
