export interface Entity {
  id: string;
  name: string;
  description?: string | null;
  entity_type_id?: string | null;
  entity_type_name?: string | null;
  association_id?: string | null;
  status?: string | null;
  is_active?: boolean | number | null;
  created_at?: string | null;
}

export interface CreateEntityPayload {
  name: string;
  description?: string;
  entity_type_id?: string;
  association_id?: string;
}

export interface UpdateEntityPayload {
  name: string;
  description?: string;
  entity_type_id?: string;
  association_id?: string;
}
