export interface EmployeeAssociation {
  id: string;
  name: string;
}

export interface Employee {
  account_id: string;
  email: string;
  role_id: string;
  role_name?: string;
  employee_id_number?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  contact_number?: string;
  address?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  onboard_date?: string;
  end_date?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  id_proof_url?: string;
  temp_password?: string | null;
  associations?: EmployeeAssociation[];
  created_at?: string;
}

export interface EmployeeCreatePayload {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role_id: string;
  association_ids: string[];
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  id_proof_url?: string;
  onboard_date?: string;
  end_date?: string;
}

export interface EmployeeUpdatePayload {
  role_id: string;
  association_ids: string[];
  onboard_date?: string;
  end_date?: string;
}
