import React, { useState } from "react";

export interface PayDuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  totalDue?: number | string;
  onPay: (pin: string) => Promise<void> | void;
}

export const PayDuesModal: React.FC<PayDuesModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  totalDue = 0,
  onPay,
}) => {
  const [payPin, setPayPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(String(totalDue || 0));
  const formattedAmount = parsedAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payPin.length !== 4) return;
    try {
      setIsSubmitting(true);
      await onPay(payPin);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPayPin("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Pay via Wallet</h3>
          <p className="text-sm text-slate-600 mb-6">
            Enter your 4-digit Wallet PIN to pay {currencySymbol}
            {formattedAmount}.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                type="password"
                maxLength={4}
                required
                value={payPin}
                onChange={(e) => setPayPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full text-center text-3xl tracking-[1em] font-mono border-b-2 border-slate-200 focus:border-indigo-600 focus:outline-none py-2 bg-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={payPin.length !== 4 || isSubmitting}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PayDuesModal;

