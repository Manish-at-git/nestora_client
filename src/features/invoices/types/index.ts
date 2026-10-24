export type InvoiceStatus = "paid" | "pending" | "overdue";

export interface Invoice {
  id: string;
  association_id: string;
  association_name: string;
  invoice_number: string;
  vendor_name: string;
  category: string;
  description: string | null;
  invoice_date: string;
  due_date: string;
  subtotal: string;
  tax_percentage: string;
  tax_amount: string;
  total_amount: string;
  status: InvoiceStatus;
  payment_date: string | null;
  payment_method: string | null;
}

export interface InvoicePayload {
  association_id: string;
  invoice_number: string;
  vendor_name: string;
  category: string;
  description?: string | null;
  invoice_date: string;
  due_date: string;
  subtotal: string;
  tax_percentage: string;
  status: InvoiceStatus;
  payment_date?: string | null;
  payment_method?: string | null;
}

export interface InvoiceList {
  rows: Invoice[];
  total_count: number;
  total_amount: string;
  paid_amount: string;
  pending_amount: string;
  overdue_amount: string;
  available_categories: string[];
}
