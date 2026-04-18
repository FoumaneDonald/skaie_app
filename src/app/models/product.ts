export interface Product {
  id: number;
  name: string;
  category?: string; // Le '?' signifie qu'il peut être NULL
  description: string;
  price: number;
  stock: number;
  image?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}