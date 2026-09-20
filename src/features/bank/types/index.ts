export interface BankAccount {
  id: string;
  association_id: string;
  association_name?: string | null;
  account_name: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name?: string | null;
  account_type?: "Current" | "Savings" | "Escrow" | "Fixed Deposit" | string | null;
  currency?: string | null;
  upi_id?: string | null;
  qr_code_url?: string | null;
  gateway_provider?: "Razorpay" | "Cashfree" | "PayU" | "Stripe" | string | null;
  merchant_id?: string | null;
  api_key?: string | null;
  api_secret?: string | null;
  webhook_secret?: string | null;
  is_default?: boolean | null;
  status?: "Active" | "Inactive" | "Suspended" | string | null;
  created_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface BankAccountCreatePayload {
  association_id: string;
  account_name: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name?: string | null;
  account_type?: string | null;
  currency?: string | null;
  upi_id?: string | null;
  qr_code_url?: string | null;
  gateway_provider?: string | null;
  merchant_id?: string | null;
  api_key?: string | null;
  api_secret?: string | null;
  webhook_secret?: string | null;
  is_default?: boolean | null;
  status?: string | null;
}

export type BankAccountUpdatePayload = Partial<BankAccountCreatePayload>;
