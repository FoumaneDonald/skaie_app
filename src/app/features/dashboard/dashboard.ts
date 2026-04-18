import { Component, inject, OnInit, signal } from '@angular/core';
import { User } from '../../core/models/auth.model';
import { AuthStateService } from '../../core/services/auth.state';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private authState = inject(AuthStateService);
  private authService = inject(Auth);

  user = signal<User | null>(null);

  ngOnInit(): void {
    this.user.set(this.authState.snapshot.user);
    this.authService.me().subscribe({ next: (u) => this.user.set(u) });
  }
}
