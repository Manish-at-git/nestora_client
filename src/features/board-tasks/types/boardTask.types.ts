export type BoardTaskStatus = "New" | "In Progress" | "Completed" | "Cancelled";

export interface BoardTask {
  id: string;
  association_id: string;
  created_by: string;
  title: string;
  description: string;
  supervised_by: string;
  image_url?: string | null;
  status: BoardTaskStatus;
  created_at: string;
  updated_at?: string | null;
  association_name?: string;
  supervised_by_name?: string | null;
  created_by_name?: string | null;
}

export interface BoardTaskFormData {
  association_id?: string;
  title: string;
  description: string;
  supervised_by: string;
  image_url?: string | null;
}

export interface BoardTaskMessage {
  id: string;
  board_task_id: string;
  sender_id: string;
  message: string;
  attachment_url?: string | null;
  created_at: string;
  email?: string;
  role_id?: string;
  role_name?: string | null;
  sender_name?: string | null;
}

export interface BoardTaskMessageFormData {
  message: string;
  attachment_url?: string | null;
}

export interface BoardMemberOption {
  account_id: string;
  name: string;
  email: string;
  contact_number?: string | null;
  profile_pic_url?: string | null;
  board_member_since?: string | null;
}
