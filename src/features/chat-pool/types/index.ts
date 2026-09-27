export type ChatPoolType = "board" | "committee";

export interface ChatPool {
  pool_type: ChatPoolType;
  pool_id: string;
  association_id: string;
  name: string;
}

export interface ChatPoolMessage {
  id: string;
  association_id?: string | null;
  pool_type?: ChatPoolType | null;
  pool_id?: string | null;
  sender_id?: string | null;
  message?: string | null;
  attachment_url?: string | null;
  created_at?: string | null;
  sender_name?: string | null;
  profile_pic_url?: string | null;
  is_mine?: boolean;
}
