export interface Wallet {
  id?: string | number;
  user_id?: string | number;
  balance: number;
  reward_points?: number;
  has_pin: boolean;
  name?: string;
  email?: string;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export type TransactionType = "Credit" | "Debit" | "UPI";
export type TransactionStatus = "Completed" | "Pending" | "Failed" | "Refunded";

export interface WalletTransaction {
  id: string | number;
  wallet_id?: string | number;
  user_id?: string | number;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  category?: string;
  recipient_email?: string;
  sender_email?: string;
  purpose?: string;
  created_at: string;
}

export interface AddMoneyPayload {
  amount: number;
  method?: string;
}

export interface SendMoneyPayload {
  recipient_email: string;
  amount: number;
  pin: string;
  purpose?: string;
}

export interface SetupPinPayload {
  pin: string;
}

export interface PayDuesPayload {
  amount?: number;
  pin: string;
}

export interface PayDuesUpiPayload {
  amount?: number;
}

export interface CreateOrderPayload {
  amount: number;
  currency?: string;
  receipt?: string;
}

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  amount: number;
}
