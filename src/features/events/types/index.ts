export type RSVPStatus = "going" | "maybe" | "not_going";

export interface EventRSVP {
  user_id?: string | number;
  user_name?: string;
  status: RSVPStatus;
  created_at?: string;
}

export interface EventComment {
  id: string | number;
  event_id: string | number;
  account_id: string;
  author_name?: string;
  comment: string;
  created_at?: string;
}

export interface EventItem {
  id: string | number;
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  location?: string;
  category?: string;
  status?: "Draft" | "Published" | "Cancelled" | string;
  is_paid?: boolean;
  fee_amount?: number;
  is_registration_required?: boolean;
  registration_deadline?: string;
  max_capacity?: number;
  audience?: string;
  send_notifications?: boolean;
  banner_url?: string;
  organizer_name?: string;
  organizer_contact?: string;
  association_id?: string | number;
  created_by?: string;
  author_name?: string;
  created_at?: string;
  updated_at?: string;
  rsvps?: EventRSVP[];
  rsvp_counts?: {
    going: number;
    maybe: number;
    not_going: number;
  };
  my_rsvp_status?: RSVPStatus | null;
  attendees_preview?: string[];
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
  [key: string]: any;
}

export interface EventFormData {
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  location?: string;
  category?: string;
  status?: string;
  is_paid?: boolean;
  fee_amount?: number;
  is_registration_required?: boolean;
  registration_deadline?: string;
  max_capacity?: number;
  audience?: string;
  send_notifications?: boolean;
  banner_url?: string;
  organizer_name?: string;
  organizer_contact?: string;
  association_id?: string | number;
}
