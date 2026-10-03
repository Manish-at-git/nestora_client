export type VisitorPassStatus = "Active" | "Used" | "Expired" | "Cancelled";

export interface PreApprovedVisitor {
  id: string;
  resident_id?: string;
  unit_id?: string;
  visitor_name: string;
  mobile: string;
  visitor_type: string;
  pass_code: string;
  otp?: string | null;
  visit_date: string;
  start_time: string;
  end_time: string;
  number_of_visitors: number;
  vehicle_number?: string | null;
  purpose?: string | null;
  pass_type: string;
  status: VisitorPassStatus;
  unit_number?: string | null;
  block_name?: string | null;
  last_check_in?: string | null;
  active_log_id?: string | null;
  created_at?: string;
}

export interface CreatePreApprovedVisitorPayload {
  visitor_name: string;
  mobile: string;
  visitor_type: string;
  visit_date: string;
  start_time: string;
  end_time: string;
  number_of_visitors: number;
  vehicle_number?: string;
  purpose?: string;
  pass_type: string;
}

export interface CreatePreApprovedVisitorResponse {
  ok: boolean;
  id: string;
  pass_code: string;
  otp: string;
}

export interface PreApprovedVisitorsResponse {
  visitors: PreApprovedVisitor[];
}

export type PublicVisitorPassResponse = PreApprovedVisitor;

export interface VisitorGateRow {
  log_id?: string;
  entry_id?: string;
  source_type?: "pre_approved" | "walk_in";
  pass_id?: string;
  visitor_name: string;
  mobile: string;
  visitor_type?: string;
  pass_type?: string;
  pass_code?: string;
  check_in?: string;
  check_out?: string | null;
  unit_number?: string;
  block_name?: string;
  gate?: string | null;
  purpose?: string | null;
  entry_type?: string;
  status?: string;
  scheduled_end?: string | null;
}

export interface ResidentSearchResult {
  user_id: string;
  name: string;
  contact_number: string;
  unit_id: string;
  unit_number: string;
  block_name?: string | null;
}

export interface PendingVisitorRequest {
  visit_id: string;
  name: string;
  mobile: string;
  photo_url?: string | null;
  purpose?: string | null;
  visitor_type?: string | null;
  number_of_visitors?: number;
  created_at?: string;
}

export interface SecurityGateRequest {
  visit_id: string;
  visitor_name: string;
  mobile: string;
  visitor_type?: string | null;
  purpose?: string | null;
  status: "Pending" | "Approved" | "Denied" | "Checked-In" | "Checked-Out";
  created_at?: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  unit_number?: string | null;
  block_name?: string | null;
}

export interface WalkInVisitorPayload {
  mobile: string;
  name: string;
  visitor_type: string;
  number_of_visitors: number;
  vehicle_number?: string;
  photo_url?: string;
  id_type?: string;
  id_number?: string;
  unit_id: string;
  purpose: string;
  expected_duration?: string;
  notes?: string;
}

export interface DeliveryRow {
  id: string;
  unit_id: string;
  unit_number?: string;
  block_name?: string;
  delivery_type: string;
  company_name?: string | null;
  delivery_person_name?: string | null;
  mobile?: string | null;
  status: string;
  check_in?: string;
  check_out?: string | null;
}
