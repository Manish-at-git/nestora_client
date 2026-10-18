export type BalanceSheetSection =
  | "current_asset"
  | "non_current_asset"
  | "current_liability"
  | "non_current_liability"
  | "equity";

export interface BalanceSheetItem {
  id: string;
  chart_of_account_id?: string | null;
  account_code?: string | null;
  section: BalanceSheetSection;
  account_name: string;
  amount: string;
  sort_order: number;
}

export interface BalanceSheetItemInput {
  section: BalanceSheetSection;
  account_name: string;
  amount: string;
  chart_of_account_id?: string | null;
}

export interface BalanceSheetTotals {
  current_assets: string;
  non_current_assets: string;
  total_assets: string;
  current_liabilities: string;
  non_current_liabilities: string;
  total_liabilities: string;
  total_equity: string;
  liabilities_and_equity: string;
  working_capital: string;
  current_ratio?: string | null;
  debt_to_equity_ratio?: string | null;
}

export interface BalanceSheet {
  id: string;
  association_id: string;
  association_name: string;
  as_on_date: string;
  items: BalanceSheetItem[];
  totals: BalanceSheetTotals;
  assets_growth_pct?: string | null;
  liabilities_growth_pct?: string | null;
  equity_growth_pct?: string | null;
  health_status?: string | null;
  health_note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BalanceSheetPayload {
  association_id: string;
  as_on_date: string;
  items: BalanceSheetItemInput[];
  health_status?: string | null;
  health_note?: string | null;
}

export interface BalanceSheetMutationResult {
  id: string;
  imported_items?: number | null;
}
