export interface StaffMember {
  id: string;
  association_id: string;
  association_name: string;
  staff_code: string;
  first_name: string;
  last_name: string;
  designation: string;
  contact_number: string;
  email: string;
  assignment_type: "common_area" | "unit";
  block_id?: string | null;
  block_name?: string | null;
  unit_id?: string | null;
  unit_number?: string | null;
  account_id?: string | null;
  temp_password?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city_id?: string | null;
  city?: string | null;
  region_id?: string | null;
  state?: string | null;
  country_id?: string | null;
  pincode?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_number?: string | null;
  id_proof_url?: string | null;
  profile_pic_url?: string | null;
  pass_code: string;
  is_active: boolean;
  active_attendance_id?: string | null;
  today_check_out_at?: string | null;
  created_at?: string;
}

export interface StaffPayload {
  association_id: string;
  first_name: string;
  last_name: string;
  designation: string;
  contact_number: string;
  email: string;
  assignment_type: "common_area" | "unit";
  block_id?: string;
  unit_id?: string;
  address_line_1: string;
  address_line_2?: string;
  city_id: string;
  pincode: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  id_proof_url?: string;
  profile_pic_url?: string;
  is_active?: boolean;
}

export interface StaffBlock {
  id: string;
  name: string;
}

export interface StaffUnit {
  id: string;
  unit_number: string;
}

export interface StaffAttendance {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_code: string;
  designation: string;
  association_id: string;
  association_name: string;
  check_in_at: string;
  check_out_at?: string | null;
  gate?: string | null;
  remarks?: string | null;
}

export interface StaffScanResponse {
  action: "checked_in" | "checked_out";
  attendance: StaffAttendance;
}

export interface StaffPastAttendancePayload {
  staff_id: string;
  check_in_at: string;
  check_out_at: string;
  gate?: string;
  remarks?: string;
}

export interface StaffMonthlyAttendanceDay {
  date: string;
  status: "present" | "incomplete" | "absent";
  check_in_at?: string | null;
  check_out_at?: string | null;
  duration_minutes?: number | null;
}

export interface StaffMonthlyAttendanceRow {
  staff_id: string;
  staff_code: string;
  staff_name: string;
  designation: string;
  days: StaffMonthlyAttendanceDay[];
  present_days: number;
  incomplete_days: number;
  total_minutes: number;
  average_minutes: number;
}

export interface StaffMonthlyAttendanceReport {
  association_id: string;
  month: string;
  total_staff: number;
  present_days: number;
  incomplete_days: number;
  total_minutes: number;
  rows: StaffMonthlyAttendanceRow[];
}
