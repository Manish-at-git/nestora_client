export interface DocumentRecord {
  id: string;
  association_id: string;
  association_name?: string;
  title: string;
  document_number?: string | null;
  document_type?: string | null;
  category?: string | null;
  file_name?: string | null;
  file_url?: string | null;
  file_type?: string | null;
  file_size_kb?: number | null;
  department?: string | null;
  related_module?: string | null;
  visibility?: string | null;
  allow_download?: boolean;
  issue_date?: string | null;
  expiry_date?: string | null;
  reminder_before_expiry_days?: number | null;
  status?: string | null;
  keywords?: string | null;
  remarks?: string | null;
  created_at?: string | null;
}

export interface DocumentPayload {
  association_id: string;
  title: string;
  document_number?: string;
  document_type?: string;
  category?: string;
  file_name?: string;
  file_url?: string;
  file_type?: string;
  file_size_kb?: number | null;
  department?: string;
  related_module?: string;
  visibility?: string;
  allow_download?: boolean;
  issue_date?: string;
  expiry_date?: string;
  reminder_before_expiry_days?: number | null;
  status?: string;
  keywords?: string;
  remarks?: string;
}
