import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../core/services/auth.state';
import { Auth } from '../../core/services/auth';
import { CartService } from '../../core/services/cart.service';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private authState = inject(AuthStateService);
  private authService = inject(Auth);
  private router = inject(Router);
  readonly cart = inject(CartService);

  user = this.authState.user$;
  sidebarOpen = signal(false);

  isAdmin = computed(() => {
    const u = this.authState.snapshot.user;
    return u?.role === 'admin' || u?.role === 'super_admin';
  });

  isCustomer = computed(() => this.authState.snapshot.user?.role === 'customer');

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}