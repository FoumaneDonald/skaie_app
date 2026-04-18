import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from '../../core/services/auth.state';
import { Auth } from '../../core/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements OnInit {
  private authService = inject(Auth);
  private authState = inject(AuthStateService);
  private router = inject(Router);

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  digits = signal<string[]>(['', '', '', '', '', '']);
  isLoading = signal(false);
  isResending = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  resendCooldown = signal(0);

  userEmail = signal('');

  ngOnInit(): void {
    const user = this.authState.snapshot.user;
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.userEmail.set(user.email);

    if (user.email_verified_at) {
      this.router.navigate(['/dashboard']);
    }
  }

  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);

    const updated = [...this.digits()];
    updated[index] = value;
    this.digits.set(updated);

    if (value && index < 5) {
      const inputs = this.otpInputs.toArray();
      inputs[index + 1]?.nativeElement.focus();
    }

    if (updated.every((d) => d !== '')) {
      this.submit();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const updated = [...this.digits()];
      if (!updated[index] && index > 0) {
        updated[index - 1] = '';
        this.digits.set(updated);
        const inputs = this.otpInputs.toArray();
        inputs[index - 1]?.nativeElement.focus();
      } else {
        updated[index] = '';
        this.digits.set(updated);
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    const updated = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    this.digits.set(updated);
    if (pasted.length === 6) this.submit();
  }

  submit(): void {
    const otp = this.digits().join('');
    if (otp.length !== 6) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.verifyEmail(otp).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.digits.set(['', '', '', '', '', '']);
        this.errorMessage.set(err.error?.message ?? 'Invalid OTP. Please try again.');
        setTimeout(() => {
          const inputs = this.otpInputs.toArray();
          inputs[0]?.nativeElement.focus();
        });
      },
    });
  }

  resend(): void {
    if (this.resendCooldown() > 0) return;
    this.isResending.set(true);
    this.errorMessage.set(null);

    this.authService.resendOtp().subscribe({
      next: () => {
        this.isResending.set(false);
        this.successMessage.set('A new OTP has been sent to your email.');
        this.startCooldown();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: () => {
        this.isResending.set(false);
        this.errorMessage.set('Failed to resend OTP. Please try again.');
      },
    });
  }

  private startCooldown(): void {
    this.resendCooldown.set(60);
    const interval = setInterval(() => {
      this.resendCooldown.update((v) => {
        if (v <= 1) {
          clearInterval(interval);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }
}
