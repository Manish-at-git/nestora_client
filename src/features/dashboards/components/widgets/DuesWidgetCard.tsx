import React from "react";
import { CheckCircle2, Wallet } from "lucide-react";
import { Account } from "@/types/auth";

export interface DuesWidgetCardProps {
  account: Account | null;
  currencySymbol: string;
  isTenant?: boolean;
  onPayDuesClick: () => void;
  getOrdinalSuffix?: (num: number) => string;
}

const defaultGetOrdinalSuffix = (i: number) => {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) return i + "st";
  if (j === 2 && k !== 12) return i + "nd";
  if (j === 3 && k !== 13) return i + "rd";
  return i + "th";
};

export const DuesWidgetCard: React.FC<DuesWidgetCardProps> = ({
  account,
  currencySymbol,
  isTenant = false,
  onPayDuesClick,
  getOrdinalSuffix = defaultGetOrdinalSuffix,
}) => {
  const isPaid = Boolean(account?.assessment_paid_this_month);
  const baseAmount = account?.assessment_amount
    ? parseFloat(String(account.assessment_amount)).toFixed(2)
    : "0.00";
  const fineAmount = parseFloat(String(account?.assessment_fine || "0")).toFixed(2);
  const hasFine = Number(account?.assessment_fine || 0) > 0;
  const totalDue = account?.assessment_total_due
    ? parseFloat(String(account.assessment_total_due)).toFixed(2)
    : "0.00";

  const frequencyLabel =
    account?.assessment_frequency === "Quarterly"
      ? "quarter"
      : account?.assessment_frequency === "Annually"
      ? "year"
      : "month";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">
        {isTenant ? "Pay Rent" : "Dues"}
      </div>

      {isPaid ? (
        <div className="flex flex-col items-center justify-center py-4 text-emerald-600 text-center">
          <CheckCircle2 size={42} className="mb-2 text-emerald-600" />
          <p className="font-semibold text-lg text-emerald-600">All Paid Up!</p>
          <p className="text-sm text-emerald-700/80 mt-0.5">
            You have paid your dues for this month.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Base Amount</span>
              <span className="font-medium text-slate-700 font-mono">
                {currencySymbol}
                {baseAmount}
              </span>
            </div>
            {hasFine && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-rose-500">Late Fee</span>
                <span className="font-medium text-rose-600 font-mono">
                  +{currencySymbol}
                  {fineAmount}
                </span>
              </div>
            )}
            <div className="border-t border-slate-100 my-1 pt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Total Due</span>
              <span className="text-3xl font-display text-indigo-600">
                {currencySymbol}
                {totalDue}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            {isTenant
              ? "Your rent is up to date."
              : `Due on the ${getOrdinalSuffix(
                  Number(account?.assessment_due_day) || 1
                )} of every ${frequencyLabel}.`}
          </p>

          <button
            onClick={onPayDuesClick}
            className="px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm rounded-full font-medium hover:bg-indigo-100 transition-colors w-full flex justify-center items-center gap-2 cursor-pointer"
          >
            <Wallet size={16} />
            {isTenant ? "Pay Rent Now" : "Pay Dues via Wallet"}
          </button>
        </>
      )}
    </div>
  );
};

export default DuesWidgetCard;

