import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../../core/services/auth.state';
import { User } from '../../core/models/auth.model';
import { environment } from '../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authState = inject(AuthStateService);

  user = signal<User | null>(null);
  saving = signal(false);
  savingPw = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
    date_of_birth: [''],
  });

  pwForm = this.fb.group({
    current_password: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });

  ngOnInit(): void {
    const u = this.authState.snapshot.user;
    this.user.set(u);
    if (u) {
      this.form.patchValue({
        name: u.name,
        phone: u.phone ?? '',
        date_of_birth: u.date_of_birth ?? '',
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    this.http.patch<User>(`${environment.apiUrl}/customer/profile`, this.form.value).subscribe({
      next: (u) => {
        this.authState.setUser(u);
        this.user.set(u);
        this.saving.set(false);
        this.successMsg.set('Profil mis à jour avec succès.');
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Erreur lors de la mise à jour.');
        this.saving.set(false);
      },
    });
  }

  savePw(): void {
    if (this.pwForm.invalid) return;
    this.savingPw.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    this.http
      .patch(`${environment.apiUrl}/customer/profile/password`, this.pwForm.value)
      .subscribe({
        next: () => {
          this.pwForm.reset();
          this.savingPw.set(false);
          this.successMsg.set('Mot de passe modifié avec succès.');
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message ?? 'Erreur modification mot de passe.');
          this.savingPw.set(false);
        },
      });
  }
}
