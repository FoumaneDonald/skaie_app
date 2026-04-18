import { Component, inject, signal } from '@angular/core';
import { AuthStateService } from '../../core/services/auth.state';
import { Auth } from '../../core/services/auth';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';
import { TranslateModule } from '@ngx-translate/core';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'grid', route: '/dashboard' },
  { label: 'Profile', icon: 'user', route: '/profile', roles: ['customer'] },
  { label: 'Addresses', icon: 'map-pin', route: '/addresses', roles: ['customer'] },
];

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    LanguageSwitcher,
    TranslateModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  authState = inject(AuthStateService);
  private authService = inject(Auth);

  sidebarOpen = signal(false);
  isLoggingOut = signal(false);

  get navItems(): NavItem[] {
    const role = this.authState.snapshot.user?.role;
    return NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role)));
  }

  logout(): void {
    this.isLoggingOut.set(true);
    this.authService.logout().subscribe({
      error: () => this.isLoggingOut.set(false),
    });
  }

  icons: Record<string, string> = {
    grid: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    'map-pin': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  };
}
