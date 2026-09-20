import React, { useState, useEffect } from "react";
import { Wallet as WalletIcon, QrCode, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ModalWrapper, FormField } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePayDuesMutation } from "../api/walletApi";
import { Wallet } from "../types";

export interface PayDuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet?: Wallet | null;
  totalDue?: number;
  currencySymbol?: string;
  onSwitchToUpi: () => void;
  onSuccess?: () => void;
}

export const PayDuesModal: React.FC<PayDuesModalProps> = ({
  isOpen,
  onClose,
  wallet,
  totalDue = 0,
  currencySymbol = "₹",
  onSwitchToUpi,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "upi" | null>(null);
  const [payPin, setPayPin] = useState("");
  const [payDues, { isLoading }] = usePayDuesMutation();

  useEffect(() => {
    if (!isOpen) {
      setPaymentMethod(null);
      setPayPin("");
    }
  }, [isOpen]);

  const handleClose = () => {
    setPaymentMethod(null);
    setPayPin("");
    onClose();
  };

  const handlePayWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payPin.length !== 4) {
      toast.error("Please enter a 4-digit security PIN");
      return;
    }

    try {
      await payDues({
        amount: totalDue,
        pin: payPin,
      }).unwrap();

      toast.success("Dues paid successfully via Wallet!");
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Failed to pay dues");
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Pay Maintenance Dues"
      description="Select a payment method to settle your unit assessment dues."
      size="md"
    >
      <div className="space-y-5 pt-1">
        {/* Total Due Amount Display */}
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Due Amount
          </p>
          <p className="text-3xl font-display font-bold text-slate-900">
            {currencySymbol}
            {totalDue.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {!paymentMethod ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("wallet")}
              className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-slate-400 hover:bg-slate-50/60 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <WalletIcon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Nestora Wallet</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Available: {currencySymbol}
                    {(wallet?.balance || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("upi")}
              className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-slate-400 hover:bg-slate-50/60 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <QrCode size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Instant UPI</p>
                  <p className="text-xs text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm, QR</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
            </button>
          </div>
        ) : paymentMethod === "wallet" ? (
          <form onSubmit={handlePayWallet} className="space-y-5">
            <FormField label="4-Digit Security PIN" required>
              <Input
                withFormField={false}
                type="password"
                maxLength={4}
                required
                autoFocus
                value={payPin}
                onChange={(e) => setPayPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="text-center font-mono tracking-[0.5em] text-lg"
                disabled={isLoading}
              />
            </FormField>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setPaymentMethod(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="default"
                size="md"
                disabled={payPin.length !== 4 || isLoading}
                isLoading={isLoading}
                className="flex-1"
              >
                Pay Now
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-5">
            <p className="text-slate-600 text-sm">
              Proceed with instant QR code scanning using any UPI application.
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setPaymentMethod(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  setPaymentMethod(null);
                  onSwitchToUpi();
                }}
                className="flex-1"
              >
                Continue to UPI
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default PayDuesModal;

