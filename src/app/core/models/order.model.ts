import { Product } from './product.model';
import { Payment } from './payment.model';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_name: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string;
  shipping_phone: string | null;
  notes: string | null;
  items?: OrderItem[];
  payment?: Payment;
  created_at: string;
  updated_at: string;
}

export interface OrdersResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateOrderRequest {
  address_id?: number;
  address_data?: {
    label: string;
    street: string;
    city: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
  };
  notes?: string;
  items: { product_id: number; quantity: number }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}