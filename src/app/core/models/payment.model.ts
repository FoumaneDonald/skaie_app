export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';

export interface Payment {
  id: number;
  order_id: number;
  user_id: number;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failure_message: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  order?: { id: number; status: string; total: number; created_at: string };
  user?: { id: number; name: string; email: string };
}

export interface PaymentsResponse {
  data: Payment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface InitiatePaymentResponse {
  message: string;
  client_secret: string;
  amount: number;
  currency: string;
  order_id: number;
}

export interface PaymentStatusResponse {
  order_id: number;
  order_status: string;
  payment_status: PaymentStatus;
  amount: number;
  currency: string;
  paid_at: string | null;
  failure_message: string | null;
}

export interface Address {
  id: number;
  user_id: number;
  label: string;
  street_line_1: string;
  street_line_2?: string | null;
  city: string;
  state?: string | null;
  zip?: string | null;
  country: string;
  phone?: string | null;
  is_default: boolean;
}