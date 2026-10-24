export type DelinquencyStatus = "resolved" | "low" | "medium" | "high";

export interface DelinquencyRowInput {
  member_name: string;
  unit_number: string;
  block?: string | null;
  charge_category: string;
  outstanding_amount: string;
  days_overdue: number;
  last_payment_date?: string | null;
}

export interface DelinquencyRow extends DelinquencyRowInput {
  id: string;
  status: DelinquencyStatus;
}

export interface DelinquencySummary {
  total_outstanding: string;
  delinquent_member_count: number;
  row_count: number;
  average_days_overdue: string;
  high_risk_count: number;
  total_billed_amount: string;
  total_collected_amount: string;
  collection_rate_percentage: string;
}

export interface DelinquencyDistributionItem {
  name: string;
  amount: string;
  percentage: string;
  row_count: number;
}

export interface DelinquencyReport {
  id: string;
  association_id: string;
  association_name: string;
  fiscal_period: string;
  applied_block?: string | null;
  applied_search?: string | null;
  available_blocks: string[];
  rows: DelinquencyRow[];
  summary: DelinquencySummary;
  charge_distribution: DelinquencyDistributionItem[];
  aging_distribution: DelinquencyDistributionItem[];
  insights: string[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DelinquencyReportPayload {
  association_id: string;
  fiscal_period: string;
  total_billed_amount: string;
  total_collected_amount: string;
  rows: DelinquencyRowInput[];
}

export interface DelinquencyMutationResult {
  id: string;
  imported_items?: number | null;
}
