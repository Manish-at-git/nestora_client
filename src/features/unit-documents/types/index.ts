export interface UnitDocumentRecord {
  id: string;
  association_id: string;
  association_name?: string | null;
  unit_id?: string | null;
  unit_number?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  name: string;
  type: string;
  description?: string | null;
  file_name?: string | null;
  file_url?: string | null;
  file_type?: string | null;
  file_size_kb?: number | null;
  created_at?: string | null;
}

export interface UnitOption {
  id: string | number;
  unit_number: string;
  block_name?: string | null;
}

export interface CreateUnitDocumentPayload {
  association_id?: string;
  unit_id?: string;
  name: string;
  type: string;
  description?: string;
  file_name?: string;
  file_url: string;
  file_type?: string;
  file_size_kb?: number | null;
}

export interface UpdateUnitDocumentPayload {
  name: string;
  type: string;
  description?: string;
}
