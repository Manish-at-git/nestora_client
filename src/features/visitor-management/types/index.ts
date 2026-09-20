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
  log_id: string;
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
