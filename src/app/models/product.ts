export interface Product {
  id?: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}