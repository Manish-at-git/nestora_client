export interface Association {
  id: string;
  name: string;
  association_code?: string | null;
  entity_id?: string | null;
  entity_name?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  url?: string | null;
  association_url?: string | null;
  contract_url?: string | null;
  current_plan_id?: string | null;
  plan_name?: string | null;
  subscription_status?: string | null;
  subscription_start?: string | null;
  subscription_end?: string | null;
  renewal_date?: string | null;
  payment_status?: string | null;
  unit_count?: number;
  is_active?: boolean | number;
  allowed_features?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AssociationStats {
  name: string;
  contract_url?: string | null;
  total_blocks?: number;
  total_units?: number;
  rented_units?: number;
  block_count?: number;
  unit_count?: number;
  homeowner_count?: number;
  floors_per_block?: Array<{
    block_name: string;
    floors: number;
  }>;
}

export interface AssociationSubscriptionPayload {
  plan_id?: string | null;
  subscription_start?: string | null;
  subscription_end?: string | null;
  payment_status?: string | null;
  renewal_date?: string | null;
  subscription_status?: string | null;
}
