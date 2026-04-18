import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list';

export const routes: Routes = [
    { path: 'products', component: ProductListComponent },
  { path: '', redirectTo: '/products', pathMatch: 'full' }
];
