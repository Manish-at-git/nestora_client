export interface EntityType {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string | null;
}

export interface CreateEntityTypePayload {
  name: string;
  description?: string;
}

export interface UpdateEntityTypePayload {
  name: string;
  description?: string;
}
