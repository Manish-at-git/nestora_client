import React from "react";
import { Lock, Sparkles, X, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { backdropVariants, modalVariants } from "@/lib/animations";

export interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string | null;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  featureName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: "transform, opacity" }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-slate-100"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-center text-white">
              <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner mb-6 relative border border-white/20">
                <Lock size={36} className="text-white drop-shadow-md" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles size={16} className="text-amber-900" />
                </div>
              </div>

              <h2 className="text-2xl font-display font-bold mb-2 tracking-tight">
                Upgrade Your Plan
              </h2>
              <p className="text-indigo-100/90 text-sm leading-relaxed px-4">
                The <strong className="text-white">{featureName}</strong> feature
                is not included in your association&apos;s current subscription.
              </p>
            </div>

            <div className="p-8 bg-slate-50">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 flex gap-4 items-center group">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">
                    Unlock Premium Features
                  </h3>
                  <p className="text-xs text-slate-500">
                    Get access to {featureName} and many other advanced tools.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                Contact Administrator <ChevronRight size={18} />
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                Reach out to your board or community manager to request an
                upgrade.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradePlanModal;
