export interface Committee {
  id: string | number;
  name: string;
  description?: string;
  association_id?: string | number;
  association_name?: string;
  start_date?: string;
  end_date?: string;
  member_count?: number;
  members?: Array<{
    id?: string | number;
    user_id: string | number;
    name: string;
    email?: string;
    profile_pic_url?: string;
    start_date?: string;
    end_date?: string;
  }>;
}

export interface CommitteeMember {
  id?: string | number;
  committee_member_id?: string | number;
  user_id: string | number;
  committee_id: string | number;
  committee_name: string;
  name: string;
  email?: string;
  phone?: string;
  profile_pic_url?: string;
  role_start_date?: string;
  role_end_date?: string;
  start_date?: string;
  end_date?: string;
  is_head?: boolean;
  association_id?: string | number;
  association_name?: string;
  status?: "active" | "past";
}

export interface HomeownerOption {
  account_id: string | number;
  user_id?: string | number;
  name: string;
  email?: string;
  profile_pic_url?: string;
}

export interface CommitteeMemberFormData {
  association_id: string | number;
  committee_id: string | number;
  user_id: string | number;
  start_date: string;
  end_date: string;
}
