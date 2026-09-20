export interface FinancialReport {
  id: string;
  association_id: string;
  association_name?: string | null;
  published_month: string;
  report_type: "Balance Sheet" | "Income Statement" | "Trial Balance" | "Cash Flow" | "Audit Report" | string;
  title: string;
  file_url: string;
  uploaded_by?: string | null;
  created_at?: string;
}

export interface FinancialReportCreatePayload {
  association_id: string;
  published_month: string;
  report_type: string;
  title: string;
  file_url: string;
}

export interface ChartOfAccount {
  id: string;
  gl_code: string;
  gl_name: string;
  structure?: string | null;
  grouping?: string | null;
  created_at?: string;
}
