export type InvoiceStatus = "pending" | "overdue" | "paid" | "cancelled";
export type DiscountType = "none" | "flat" | "percentage";

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: string;
  rate: string;
  amount: string;
  sort_order: number;
}

export interface InvoiceLinePayload {
  description: string;
  quantity: string;
  rate: string;
}

export interface Invoice {
  id: string;
  association_id: string;
  association_name: string;
  vendor_id: string | null;
  vendor_name: string;
  vendor_service: string;
  payment_account: InvoicePaymentAccount | null;
  billing_address: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  fiscal_period: string;
  payment_terms: string | null;
  lines: InvoiceLine[];
  discount_type: DiscountType;
  discount_value: string;
  tax_type: string | null;
  tax_rate: string;
  notes: string | null;
  subtotal: string;
  discount_amount: string;
  tax_amount: string;
  grand_total: string;
  status: InvoiceStatus;
  payment_date: string | null;
  payment_method: string | null;
}

export interface InvoicePaymentAccount {
  bank_name: string;
  account_number: string;
  ifsc_code: string;
}

export interface InvoicePayload {
  association_id: string;
  vendor_id: string;
  billing_address: string;
  invoice_number?: string;
  issue_date: string;
  due_date: string;
  payment_terms: string;
  lines: InvoiceLinePayload[];
  discount_type: DiscountType;
  discount_value: string;
  tax_type?: string | null;
  tax_rate: string;
  notes?: string | null;
  status: InvoiceStatus;
  payment_date?: string | null;
  payment_method?: string | null;
}

export interface InvoiceList {
  rows: Invoice[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  total_amount: string;
  paid_amount: string;
  pending_amount: string;
  overdue_amount: string;
  available_fiscal_periods: string[];
}

export interface InvoiceVendor {
  id: string;
  name: string;
  service_type: string;
  payment_terms: string | null;
  payment_account: InvoicePaymentAccount | null;
}
