export interface Address {
  id: number;
  user_id: number;
  label: string | null;
  street_line_1: string;
  street_line_2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressRequest {
  label?: string;
  street_line_1: string;
  street_line_2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  is_default?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}
