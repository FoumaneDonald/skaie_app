import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

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

  signupForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit() {
    try {
      const rawForm = this.signupForm.getRawValue();
      this.authService
        .register({
          name: rawForm.name!,
          email: rawForm.email!,
          password: rawForm.password!,
          confirmPassword: rawForm.password!,
        })
        .subscribe(() => {
          this.router.navigate(['/dashboard']);
        });
      // await this.authService.register(
      //   this.signupForm.value.name!,
      //   this.signupForm.value.email!,
      //   this.signupForm.value.password!,
      // );
    } catch (error: any) {
      alert(error.message || 'Registration failed!');
    }
  }
}
