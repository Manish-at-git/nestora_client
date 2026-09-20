export interface SubscriptionPlan {
  id: string;
  name: string;
  code?: string | null;
  country: string;
  description?: string | null;
  monthly_price?: number | null;
  yearly_price?: number | null;
  trial_days: number;
  is_active: boolean | number;
  features?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionPlanCreatePayload {
  name: string;
  code?: string | null;
  country: string;
  description?: string | null;
  monthly_price?: number | null;
  yearly_price?: number | null;
  trial_days?: number;
  is_active: boolean;
  feature_ids?: string[];
}

export interface SubscriptionPlanUpdatePayload {
  name: string;
  code?: string | null;
  country: string;
  description?: string | null;
  monthly_price?: number | null;
  yearly_price?: number | null;
  trial_days?: number;
  is_active: boolean;
  feature_ids?: string[];
}

export interface SetPlanFeaturesPayload {
  plan_id: string;
  feature_ids: string[];
}
