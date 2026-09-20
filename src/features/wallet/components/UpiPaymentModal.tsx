import React from "react";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import { ModalWrapper } from "@/components/common";
import { Button } from "@/components/ui/button";
import { usePayDuesUPIMutation } from "../api/walletApi";

export interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalDue?: number;
  currencySymbol?: string;
  onSuccess?: () => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  totalDue = 0,
  currencySymbol = "₹",
  onSuccess,
}) => {
  const [payDuesUPI, { isLoading }] = usePayDuesUPIMutation();

  const handleSimulatePayment = async () => {
    try {
      await payDuesUPI({
        amount: totalDue,
      }).unwrap();

      toast.success("Dues paid successfully via UPI!");
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Failed to pay dues via UPI");
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="UPI QR Payment"
      description="Scan with any UPI app (GPay, PhonePe, Paytm) to complete payment."
      size="sm"
    >
      <div className="flex flex-col items-center pt-2">
        <div className="w-48 h-48 bg-slate-50 rounded-2xl mb-4 flex items-center justify-center border-2 border-slate-200/90 shadow-inner">
          <QrCode size={120} className="text-slate-800" />
        </div>

        <div className="text-center mb-6">
          <p className="text-xs text-slate-500 mb-0.5">Amount to pay</p>
          <p className="text-2xl font-bold font-mono text-slate-900">
            {currencySymbol}
            {totalDue.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSimulatePayment}
            disabled={isLoading}
            isLoading={isLoading}
            className="flex-1"
          >
            Simulate Paid
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default UpiPaymentModal;

