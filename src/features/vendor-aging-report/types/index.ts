export type VendorAgingStatus = "due_soon" | "overdue" | "settled";

export interface VendorAgingRowInput {
  vendor_name: string;
  category: string;
  invoice_number: string;
  invoice_date: string;
  current_due: string;
  days_1_30: string;
  days_31_60: string;
  days_61_90: string;
  days_over_90: string;
}

export interface VendorAgingRow extends VendorAgingRowInput {
  id: string;
  total_outstanding: string;
  overdue_amount: string;
  status: VendorAgingStatus;
}

export interface VendorAgingSummary {
  vendor_count: number;
  invoice_count: number;
  total_outstanding: string;
  overdue_amount: string;
  current_amount: string;
  overdue_percentage: string;
  overdue_invoice_count: number;
}

export interface VendorAgingDistributionItem {
  name: string;
  amount: string;
  percentage: string;
  invoice_count: number;
}

export interface VendorAgingReport {
  id: string;
  association_id: string;
  association_name: string;
  fiscal_period: string;
  applied_category?: string | null;
  applied_search?: string | null;
  available_categories: string[];
  rows: VendorAgingRow[];
  summary: VendorAgingSummary;
  aging_distribution: VendorAgingDistributionItem[];
  category_distribution: VendorAgingDistributionItem[];
  insights: string[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VendorAgingReportPayload {
  association_id: string;
  fiscal_period: string;
  rows: VendorAgingRowInput[];
}

export interface VendorAgingMutationResult {
  id: string;
  imported_items?: number | null;
}
