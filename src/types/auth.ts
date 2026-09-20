export type UserRole =
  | "Super admin"
  | "Admin"
  | "Board member"
  | "Homeowner"
  | "Tenant"
  | "Committee member"
  | "Security"
  | "Accountant"
  | "CSR";

export interface RolePermission {
  can_view: boolean;
  can_create?: boolean;
  can_update?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  feature_id?: string;
  feature_name?: string;
  feature_code?: string;
  parent_id?: string | null;
  icon?: string | null;
  url?: string | null;
  order_index?: number;
  sidebar_order?: number;
}

export interface Account {
  id: string;
  email: string;
  role: UserRole;
  role_code?: string;
  allowed_features?: string[];
  role_permissions?: RolePermission[] | Record<string, RolePermission>;
  subscription_status?: "Active" | "Expired" | "Pending" | "Trial";
  association_id?: string;
  country?: string;
  assessment_total_due?: number | string;
  status?: string;
  name?: string;
  phone?: string;
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  unit_number?: string;
  block_name?: string;
  association_name?: string;
  country?: string;
  [key: string]: any;
}

export interface AuthState {
  account: Account | null;
  profile: UserProfile | null;
  checking: boolean;
}
