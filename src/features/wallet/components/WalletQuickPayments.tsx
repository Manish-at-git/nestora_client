import React from "react";
import { ShieldCheck, Dumbbell, ShoppingBag, Wrench, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export interface WalletQuickPaymentsProps {
  hasPaidThisMonth?: boolean;
  totalDue?: number;
  onPayMaintenance: () => void;
}

export const WalletQuickPayments: React.FC<WalletQuickPaymentsProps> = ({
  hasPaidThisMonth = false,
  totalDue = 0,
  onPayMaintenance,
}) => {
  const handleMaintenanceClick = () => {
    if (hasPaidThisMonth) {
      toast.success("Dues are already paid for this month!");
    } else if (totalDue > 0) {
      onPayMaintenance();
    } else {
      toast.info("No dues pending at this time.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-semibold text-slate-800 tracking-tight">Quick Payments & Dues</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Maintenance Tile */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleMaintenanceClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleMaintenanceClick();
            }
          }}
          className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 hover:shadow-sm transition-all cursor-pointer text-center group relative overflow-hidden"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="font-semibold text-slate-800 text-sm block">Maintenance</span>
            {hasPaidThisMonth ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-0.5">
                <CheckCircle2 size={11} /> Paid
              </span>
            ) : totalDue > 0 ? (
              <span className="text-[11px] font-medium text-amber-600 mt-0.5 block">
                Due Pending
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Up to date
              </span>
            )}
          </div>
        </div>

        {/* Amenities Tile */}
        <div className="bg-slate-50/60 border border-slate-200/70 rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 text-center opacity-75 select-none">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <Dumbbell size={22} />
          </div>
          <div>
            <span className="font-semibold text-slate-700 text-sm block">Amenities</span>
            <span className="text-[10px] font-medium bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full inline-block mt-1">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Marketplace Tile */}
        <div className="bg-slate-50/60 border border-slate-200/70 rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 text-center opacity-75 select-none">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <ShoppingBag size={22} />
          </div>
          <div>
            <span className="font-semibold text-slate-700 text-sm block">Marketplace</span>
            <span className="text-[10px] font-medium bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full inline-block mt-1">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Services Tile */}
        <div className="bg-slate-50/60 border border-slate-200/70 rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 text-center opacity-75 select-none">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <Wrench size={22} />
          </div>
          <div>
            <span className="font-semibold text-slate-700 text-sm block">Services</span>
            <span className="text-[10px] font-medium bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full inline-block mt-1">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletQuickPayments;

