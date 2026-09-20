export interface Permission {
  id: string;
  role_id: string;
  feature_id: string;
  can_create: boolean | number;
  can_view: boolean | number;
  can_update: boolean | number;
  can_delete: boolean | number;
  sidebar_order?: number;
  role_name?: string;
  feature_name?: string;
  created_at?: string;
}

export interface PermissionCreatePayload {
  role_id: string;
  feature_id: string;
  can_create: boolean;
  can_view: boolean;
  can_update: boolean;
  can_delete: boolean;
  sidebar_order?: number;
}

export interface PermissionUpdatePayload {
  role_id: string;
  feature_id: string;
  can_create: boolean;
  can_view: boolean;
  can_update: boolean;
  can_delete: boolean;
  sidebar_order?: number;
}

export interface RolePermissionSummary {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  entity_id?: string | null;
  entity_name?: string | null;
  is_active: boolean | number;
  created_at?: string;
  configured_features_count: number;
  accounts_count: number;
  total_features_count: number;
}

export interface RolePermissionMatrixItem {
  feature_id: string;
  feature_name: string;
  feature_code: string;
  feature_description?: string | null;
  parent_id?: string | null;
  parent_name?: string | null;
  url?: string | null;
  order_index?: number;
  icon?: string | null;
  can_create: boolean | number;
  can_view: boolean | number;
  can_update: boolean | number;
  can_delete: boolean | number;
  sidebar_order: number;
}

export interface RolePermissionMatrixResponse {
  role: {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    entity_id?: string | null;
    entity_name?: string | null;
    is_active: boolean | number;
  };
  features: RolePermissionMatrixItem[];
}

export interface BulkPermissionPayload {
  role_id: string;
  permissions: {
    feature_id: string;
    can_create: boolean;
    can_view: boolean;
    can_update: boolean;
    can_delete: boolean;
    sidebar_order: number;
  }[];
}
