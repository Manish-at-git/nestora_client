export interface Feature {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  parent_id?: string | null;
  parent_name?: string | null;
  icon?: string | null;
  url?: string | null;
  order_index?: number;
  is_active: boolean | number;
  created_at?: string;
}

export interface FeaturePayload {
  name: string;
  code: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  url?: string;
  is_active: boolean;
}

export interface ParentFeatureOption {
  id: string;
  name: string;
}
