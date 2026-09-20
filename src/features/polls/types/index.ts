export interface PollOption {
  id: string | number;
  text?: string;
  option_text?: string;
  votes_count?: number;
  vote_count?: number;
  percentage?: number;
  vote_percentage?: number;
  [key: string]: any;
}

export interface Poll {
  id: string | number;
  question: string;
  description?: string;
  options: PollOption[];
  is_multiple_choice?: boolean;
  status: "Draft" | "Published" | "Closed" | string;
  visibility?: string;
  total_votes?: number;
  end_date?: string;
  my_votes?: Array<string | number>;
  association_id?: string | number;
  created_at?: string;
  created_by?: string | number;
  author_name?: string;
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
  [key: string]: any;
}

export interface PollFormData {
  question: string;
  description?: string;
  options: string[];
  is_multiple_choice?: boolean;
  status?: string;
  visibility?: string;
  end_date?: string;
  association_id?: string | number;
}
