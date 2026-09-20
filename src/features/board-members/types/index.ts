export interface BoardMember {
  id?: string | number;
  account_id: string | number;
  user_id?: string | number;
  name: string;
  email?: string;
  contact_number?: string;
  profile_pic_url?: string;
  board_member_since?: string;
  term_start_date?: string;
  term_end_date?: string;
  status?: "active" | "past" | string;
  role?: string;
  association_id?: string | number;
  association_name?: string;
  [key: string]: any;
}

export interface HomeownerOption {
  account_id: string | number;
  name: string;
  email?: string;
  profile_pic_url?: string;
}

export interface BoardMemberFormData {
  association_id: string | number;
  account_id: string | number;
  term_start_date: string;
  term_end_date: string;
}
