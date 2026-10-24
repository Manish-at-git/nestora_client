export type PrepaidStatus = "active" | "expired";

export interface PrepaidReportRowInput {
  member_name: string;
  unit_number: string;
  block?: string | null;
  category: string;
  prepaid_amount: string;
  used_amount: string;
  expiry_date: string;
}

export interface PrepaidReportRow extends PrepaidReportRowInput {
  id: string;
  available_balance: string;
  status: PrepaidStatus;
}

export interface PrepaidReportSummary {
  total_prepaid_amount: string;
  total_used_amount: string;
  total_available_balance: string;
  member_count: number;
  average_prepaid_amount: string;
  utilization_pct: string;
  active_count: number;
  expired_count: number;
}

export interface PrepaidDistributionItem {
  name: string;
  amount: string;
  percentage: string;
  row_count: number;
}

export interface PrepaidReport {
  id: string;
  association_id: string;
  association_name: string;
  fiscal_period: string;
  applied_block?: string | null;
  available_blocks: string[];
  rows: PrepaidReportRow[];
  summary: PrepaidReportSummary;
  category_distribution: PrepaidDistributionItem[];
  status_distribution: PrepaidDistributionItem[];
  insights: string[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PrepaidReportPayload {
  association_id: string;
  fiscal_period: string;
  rows: PrepaidReportRowInput[];
}

export interface PrepaidReportMutationResult {
  id: string;
  imported_items?: number | null;
}
