export interface Role {
  id: string;
  entity_id?: string | null;
  name: string;
  code: string;
  description?: string | null;
  is_active: boolean | number;
  created_at?: string;
  entity_name?: string | null;
}

export interface RolePayload {
  name: string;
  code: string;
  description?: string;
  entity_id?: string;
  is_active: boolean;
}

export interface EntityOption {
  id: string;
  name: string;
}
