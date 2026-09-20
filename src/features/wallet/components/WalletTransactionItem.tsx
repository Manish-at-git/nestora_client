import React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { StatusPill } from "@/components/common";
import { WalletTransaction } from "../types";

export interface WalletTransactionItemProps {
  transaction: WalletTransaction;
  currencySymbol?: string;
}

export const WalletTransactionItem: React.FC<WalletTransactionItemProps> = ({
  transaction,
  currencySymbol = "₹",
}) => {
  const isCredit = transaction.type === "Credit";

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isCredit
              ? "bg-emerald-50/80 text-emerald-600 border-emerald-200/50"
              : "bg-rose-50/80 text-rose-600 border-rose-200/50"
          }`}
        >
          {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-800 text-sm truncate">
            {transaction.description}
          </h4>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
            <span>{formatDate(transaction.created_at)}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <StatusPill status={transaction.status} size="xs" dot={false}/>
          </div>
        </div>
      </div>

      <div
        className={`font-semibold font-mono text-sm sm:text-base shrink-0 pl-3 ${
          isCredit ? "text-emerald-600" : "text-slate-800"
        }`}
      >
        {isCredit ? "+" : "-"}
        {currencySymbol}
        {Number(transaction.amount || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    </div>
  );
};

export default WalletTransactionItem;

