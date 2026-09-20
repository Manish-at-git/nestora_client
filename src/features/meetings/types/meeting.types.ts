export interface AttendanceStats {
  yes_count: number;
  maybe_count: number;
  no_count: number;
  no_response_count: number;
}

export interface Meeting {
  id: string | number;
  association_id: string | number;
  association_name?: string;
  created_by?: string | number;
  created_by_name?: string;
  title: string;
  meeting_type: string;
  priority: "Low" | "Medium" | "High" | string;
  audience: "Board Members" | "Committee Member" | "Homeowner" | string;
  agenda: string;
  description: string;
  meeting_date: string;
  meeting_time: string;
  duration: string;
  venue: string;
  meeting_link?: string;
  organizer?: string | number;
  organizer_name?: string;
  attachment_url?: string;
  target_block_id?: string | null;
  target_block_name?: string | null;
  status?: "Scheduled" | "Completed" | string;
  discussed_topic?: string;
  meeting_minutes?: string;
  created_at?: string;
  updated_at?: string;
  my_attendance_status?: "Yes" | "No" | "Maybe" | null;
  attendance_stats?: AttendanceStats;
}

export type { MeetingFormData } from "../schemas/meetingSchema";
export type { MeetingMinutesFormData } from "../schemas/meetingMinutesSchema";
