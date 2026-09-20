export interface SystemUser {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  contact_number?: string | null;
  email?: string | null;
  account_id?: string | null;
  activation_code?: string | null;
  activation_status?: string | null;
  role_name?: string | null;
  unit_id?: string | null;
  block_id?: string | null;
  association_id?: string | null;
  association_name?: string | null;
  block_name?: string | null;
  unit_number?: string | null;
  assoc_addr1?: string | null;
  assoc_addr2?: string | null;
  assoc_city?: string | null;
  assoc_state?: string | null;
  assoc_pincode?: string | null;
  created_at?: string;
}

export interface AdminCreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role_id: string;
  association_id: string;
}

export interface AdminUpdateUserPayload {
  email?: string;
  contact_number?: string;
  association_id?: string;
  block_name?: string;
  unit_number?: string;
  role_name?: string;
}
