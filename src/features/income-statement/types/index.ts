export type IncomeStatementItemType = "income" | "expense";

export interface IncomeStatementItem {
  id: string;
  item_type: IncomeStatementItemType;
  name: string;
  current_amount: string;
  previous_amount: string;
  variance_pct: string;
}

export interface IncomeStatementInsight {
  type: string;
  title: string;
  description: string;
}

export interface IncomeStatement {
  id: string;
  association_id: string;
  association_name: string;
  fiscal_period: string;
  items: IncomeStatementItem[];
  total_income: string;
  total_expenses: string;
  net_surplus: string;
  operating_margin_pct: string;
  income_growth_pct?: string | null;
  expenses_growth_pct?: string | null;
  net_surplus_growth_pct?: string | null;
  operating_margin_growth_pct?: string | null;
  insights: IncomeStatementInsight[];
  monthly_trend: Array<{ month: string; income: number; expenses: number }>;
}

export interface IncomeStatementItemInput {
  item_type: IncomeStatementItemType;
  name: string;
  current_amount: string;
  previous_amount: string;
}

export interface IncomeStatementPayload {
  association_id: string;
  fiscal_period: string;
  items: IncomeStatementItemInput[];
  income_growth_pct?: string | null;
  expenses_growth_pct?: string | null;
  net_surplus_growth_pct?: string | null;
  operating_margin_growth_pct?: string | null;
  insights: IncomeStatementInsight[];
  monthly_trend: Array<{ month: string; income: number; expenses: number }>;
}

export interface IncomeStatementMutationResult {
  id: string;
}
