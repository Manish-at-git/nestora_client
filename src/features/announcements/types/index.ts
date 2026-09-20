export type AnnouncementCategory =
  | "General"
  | "Meeting Notice"
  | "Financial Updates"
  | "Safety Advisory"
  | "Maintenance"
  | "Urgent"
  | "Celebration"
  | string;

export type AnnouncementAudience =
  | "All"
  | "Homeowners"
  | "Board Member"
  | "Committee Members"
  | string;

export interface Announcement {
  id: string | number;
  title: string;
  body: string;
  category: AnnouncementCategory;
  audience?: AnnouncementAudience;
  attachment_url?: string;
  association_id?: string | number;
  pinned?: boolean;
  created_at?: string;
  updated_at?: string;
  author_name?: string;
  author_role?: string;
  likes_count?: number;
  comments_count?: number;
  liked?: boolean;
  [key: string]: any;
}

export interface AnnouncementFormData {
  title: string;
  body: string;
  category: string;
  audience: string;
  attachment_url?: string;
  association_id?: string | number;
  pinned: boolean;
}

export interface AnnouncementComment {
  id: string | number;
  comment: string;
  created_at?: string;
  author_name?: string;
}
