export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  price_min?: number;
  price_max?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  per_page?: number;
  page?: number;
}