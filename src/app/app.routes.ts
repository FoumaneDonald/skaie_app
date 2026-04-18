import { Routes } from '@angular/router';
import { guestGuard, verifiedGuard, roleGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // ── Auth (guest only ou en cours de vérification) ───────────
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./auth/register/register').then((m) => m.Register),
      },
      {
        path: 'verify-email',
        // On ne met pas de guestGuard ici car l'utilisateur vient d'être créé 
        // et peut être techniquement "loggé" mais non vérifié
        loadComponent: () => import('./auth/verify-email/verify-email').then((m) => m.VerifyEmail),
      },
    ],
  },

  // ── App layout (authenticated + verified) ───────────────────
  {
    path: '',
    canActivate: [verifiedGuard],
    loadComponent: () => import('./features/layout/layout').then((m) => m.Layout),
    children: [

      // Dashboard commun
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },

      // ── Customer ──────────────────────────────────────────
      {
        path: 'shop',
        canActivate: [roleGuard(['customer'])],
        loadComponent: () => import('./features/product-list/product-list').then((m) => m.ProductList),
      },
      {
        path: 'cart',
        canActivate: [roleGuard(['customer'])],
        loadComponent: () => import('./features/cart/cart').then((m) => m.Cart),
      },
      {
        path: 'profile',
        canActivate: [roleGuard(['customer'])],
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'addresses',
        canActivate: [roleGuard(['customer'])],
        loadComponent: () => import('./features/addresses/addresses').then((m) => m.Addresses),
      },

      // Commandes client
      {
        path: 'orders',
        canActivate: [roleGuard(['customer'])],
        loadComponent: () => import('./features/order-list/order-list').then((m) => m.OrderList),
      },
      {
        path: 'orders/:id',
        canActivate: [roleGuard(['customer'])],
        loadComponent: () => import('./features/order-detail/order-detail').then((m) => m.OrderDetail),
      },

      // Paiements client
      {
        path: 'payments',
        canActivate: [roleGuard(['customer'])],
        loadComponent: () => import('./features/payment-history/payment-history').then((m) => m.PaymentHistory),
      },

      // ── Admin ─────────────────────────────────────────────
      {
        path: 'admin',
        canActivate: [roleGuard(['admin', 'super_admin'])],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
          },
          {
            path: 'orders',
            loadComponent: () => import('./features/order-list/order-list').then((m) => m.OrderList),
          },
          {
            path: 'orders/:id',
            loadComponent: () => import('./features/order-detail/order-detail').then((m) => m.OrderDetail),
          },
          {
            path: 'payments',
            loadComponent: () => import('./features/payment-history/payment-history').then((m) => m.PaymentHistory),
          },
        ],
      },
    ],
  },

  // ── Checkout (hors layout, pages pleine largeur) ────────────
  {
    path: 'checkout',
    canActivate: [verifiedGuard, roleGuard(['customer'])],
    children: [
      {
        path: 'address',
        loadComponent: () => import('./features/checkout-address/checkout-address').then((m) => m.CheckoutAddress),
      },
      {
        path: 'payment/:orderId',
        loadComponent: () => import('./features/checkout-payment/checkout-payment').then((m) => m.CheckoutPayment),
      },
      {
        path: 'success/:orderId',
        loadComponent: () => import('./features/payment-success/payment-success').then((m) => m.PaymentSuccess),
      },
    ],
  },

  // ── Résultat paiement Stripe (return_url) ───────────────────
  {
    path: 'payment-result',
    canActivate: [verifiedGuard],
    loadComponent: () => import('./features/payment-result/payment-result').then((m) => m.PaymentResult),
  },

  // ── Paiement avancé (payment-form avec Stripe Payment Element)
  {
    path: 'orders/:orderId/pay',
    canActivate: [verifiedGuard, roleGuard(['customer'])],
    loadComponent: () => import('./features/payment-form/payment-form').then((m) => m.PaymentForm),
  },

  // Fallback
  { path: '**', redirectTo: '/dashboard' },
];