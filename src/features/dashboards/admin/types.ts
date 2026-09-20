export interface AdminAssociation {
  id: string | number;
  name: string;
  code?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  unit_count?: number;
  total_units?: number;
  plan_name?: string;
  plan_tier?: string;
  is_active?: boolean | number;
  status?: string;
  allowed_features?: string[];
  created_at?: string;
}

export interface AssessmentRules {
  frequency: string;
  default_amount: number;
  due_day_of_month: number;
}

export interface FineRule {
  id?: string;
  fine_type: string;
  amount: number;
  grace_period_days: number;
}

export interface AssociationSettings {
  onboarding_date: string;
  end_date: string;
  assessment_rules: AssessmentRules;
  fine_rules: FineRule[];
}

export interface Amenity {
  id: string | number;
  association_id?: string | number;
  name: string;
  charges: number;
  status: boolean | number;
  created_at?: string;
}

export interface BoardMemberItem {
  id: string | number;
  account_id?: string | number;
  name: string;
  email: string;
  profile_pic_url?: string | null;
  association_id?: string | number;
  association_name: string;
  status: "active" | "past" | string;
  term_start_date: string;
  term_end_date: string;
}

export interface CommitteeMemberItem {
  id?: string | number;
  user_id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  committee_id: string | number;
  committee_name: string;
  association_id?: string | number;
  role_start_date?: string | null;
  role_end_date?: string | null;
}

export interface HomeownerOption {
  account_id?: string | number;
  user_id?: string | number;
  name: string;
  email: string;
}

export interface CommitteeOption {
  id: string | number;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
}
