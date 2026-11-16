export type ViolationStatus = "New" | "Pending Board" | "Approved" | "Rejected" | "Dismissed";

export interface Violation {
  id: string;
  display_id: string;
  association_id: string;
  title: string;
  category: string;
  incident_at?: string | null;
  description: string;
  proof_url?: string | null;
  audio_url?: string | null;
  knows_violator: boolean;
  status: ViolationStatus;
  offense_count?: number | null;
  action?: string | null;
  fine_amount?: string | number | null;
  fine_applied: boolean;
  admin_notes?: string | null;
  board_notes?: string | null;
  violator_response?: string | null;
  responded_at?: string | null;
  reporter_name?: string | null;
  reporter_unit_number?: string | null;
  violator_name?: string | null;
  violator_unit_number?: string | null;
  is_current_user_violator?: boolean;
  created_at: string;
}

export interface EligibleResident {
  user_id: string;
  account_id?: string | null;
  unit_id: string;
  role_code: string;
  name: string;
  unit_number?: string | null;
  block_name?: string | null;
}

export interface ViolationMessage {
  id: string;
  violation_id: string;
  sender_account_id: string;
  sender_name?: string | null;
  body?: string | null;
  attachment_url?: string | null;
  created_at: string;
}

export interface ActiveViolationFine {
  id: string;
  display_id: string;
  title: string;
  category: string;
  fine_amount: string | number;
}
