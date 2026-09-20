import React from "react";
import { ChevronRight, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletTransaction } from "../types";
import { WalletTransactionItem } from "./WalletTransactionItem";

export interface WalletTransactionsListProps {
  transactions: WalletTransaction[];
  currencySymbol?: string;
  onViewAll: () => void;
}

export const WalletTransactionsList: React.FC<WalletTransactionsListProps> = ({
  transactions,
  currencySymbol = "₹",
  onViewAll,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
      <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-semibold text-slate-800 tracking-tight">Recent Transactions</h3>
          {transactions.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {transactions.length}
            </span>
          )}
        </div>
        {transactions.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onViewAll}
            className="inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </Button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-3">
              <ReceiptText size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-700">No transactions yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Add funds to your wallet or make a maintenance payment to start viewing transaction history.
            </p>
          </div>
        ) : (
          transactions
            .slice(0, 5)
            .map((tx) => (
              <WalletTransactionItem
                key={tx.id}
                transaction={tx}
                currencySymbol={currencySymbol}
              />
            ))
        )}
      </div>
    </div>
  );
};

export default WalletTransactionsList;

