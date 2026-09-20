import React from "react";
import { Plus, Send, ShieldCheck, Wallet as WalletIcon, Sparkles } from "lucide-react";
import { Wallet } from "../types";

export interface WalletBalanceCardProps {
  wallet?: Wallet | null;
  currencySymbol?: string;
  onAddMoney: () => void;
  onSendMoney: () => void;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  wallet,
  currencySymbol = "₹",
  onAddMoney,
  onSendMoney,
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-6 border border-slate-800 shadow-md relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Background Watermark */}
      <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-5 pointer-events-none select-none text-white">
        <WalletIcon size={140} />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/15 backdrop-blur-xs">
            <span>My Wallet</span>
          </div>

          <div className="text-3xl sm:text-5xl font-display font-bold tracking-tight flex items-baseline gap-1 text-white mb-2">
            <span className="text-2xl sm:text-3xl font-light text-slate-400 select-none">
              {currencySymbol}
            </span>
            <span>
              {(wallet?.balance || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium">
            <Sparkles size={13} className="text-amber-400" />
            <span>Reward Points:</span>
            <span className="font-semibold text-white">{wallet?.reward_points || 0}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onAddMoney}
            className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-98 transition-all shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <Plus size={16} /> Add Money
          </button>
          <button
            type="button"
            onClick={onSendMoney}
            className="px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-white/15 active:scale-98 transition-all cursor-pointer backdrop-blur-xs w-full sm:w-auto"
          >
            <Send size={15} /> Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletBalanceCard;

