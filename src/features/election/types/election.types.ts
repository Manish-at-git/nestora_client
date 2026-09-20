export interface Candidate {
  id: string | number;
  name: string;
  unit_number?: string;
  bio?: string;
  manifesto?: string;
  avatar_url?: string;
  vote_count?: number;
}

export interface Election {
  id: string | number;
  association_id: string | number;
  association_name?: string;
  title: string;
  description: string;
  election_type: "Board Election" | "Committee Election" | "Referendum" | string;
  status: "Draft" | "Upcoming" | "Active" | "Completed" | string;
  start_date: string;
  end_date: string;
  total_eligible_voters?: number;
  total_votes_cast?: number;
  candidates?: Candidate[];
  has_voted?: boolean;
  my_vote_candidate_id?: string | number;
  created_at?: string;
}

export type ElectionFilter = "all" | "active" | "upcoming" | "completed";
