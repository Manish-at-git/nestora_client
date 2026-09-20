import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ModalWrapper, FormField } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import {
  useAddMoneyMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} from "../api/walletApi";
import { Wallet } from "../types";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet?: Wallet | null;
  currencySymbol?: string;
  onSuccess?: () => void;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  isOpen,
  onClose,
  wallet,
  currencySymbol = "₹",
  onSuccess,
}) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [addMoney, { isLoading: isAddingUpi }] = useAddMoneyMutation();
  const [createOrder] = useCreateRazorpayOrderMutation();
  const [verifyPayment] = useVerifyRazorpayPaymentMutation();

  const resetForm = () => {
    setAmount("");
    setPaymentMethod("upi");
    setLoadingRazorpay(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAmountChange = (val: string) => {
    if (!val) {
      setAmount("");
      return;
    }
    if (val.startsWith("-")) return;
    if (val.includes(".")) {
      const [intPart, decPart] = val.split(".");
      if (decPart && decPart.length > 2) {
        setAmount(`${intPart}.${decPart.slice(0, 2)}`);
        return;
      }
    }
    setAmount(val);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await addMoney({ amount: num, method: "UPI" }).unwrap();
      toast.success("Money added to wallet successfully!");
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Failed to add money");
    }
  };

  const handleRazorpayCheckout = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amountInPaise = Math.round(numAmount * 100);
    if (amountInPaise < 100) {
      toast.error("Minimum amount for Razorpay is ₹1");
      return;
    }

    setLoadingRazorpay(true);
    try {
      const orderData = await createOrder({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      }).unwrap();

      const orderId = orderData.order_id || orderData.id;
      if (!orderId) {
        throw new Error("Order creation failed: No order ID returned");
      }

      if (!window.Razorpay) {
        // Fallback simulation if Razorpay SDK script not loaded
        await addMoney({ amount: numAmount, method: "Razorpay (Simulated)" }).unwrap();
        toast.success("Payment simulated! Money added to wallet.");
        setAmount("");
        onClose();
        onSuccess?.();
        return;
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TLn5Q8elmgvvPh";

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Nestora Community",
        description: "Add Money to Wallet",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: numAmount,
            }).unwrap();

            if (verifyRes.success || verifyRes.ok) {
              if (!verifyRes.wallet_added) {
                await addMoney({ amount: numAmount, method: "Razorpay" }).unwrap();
              }
              toast.success("Payment successful! Money added to wallet.");
              handleClose();
              onSuccess?.();
            } else {
              toast.error(verifyRes.message || "Payment verification failed");
            }
          } catch (verifyErr: any) {
            toast.error(verifyErr?.data?.detail || "Payment verification failed");
          } finally {
            setLoadingRazorpay(false);
          }
        },
        prefill: {
          name: wallet?.name || "Resident User",
          email: wallet?.email || "user@nestora.io",
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment window closed");
            setLoadingRazorpay(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: any) {
        toast.error(response.error?.description || "Payment failed");
        setLoadingRazorpay(false);
      });
      razorpayInstance.open();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.message || "Failed to initiate Razorpay checkout");
      setLoadingRazorpay(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Money to Wallet"
      description="Top up your resident wallet balance using instant UPI or card gateway."
      size="md"
    >
      <form onSubmit={handleQuickAdd} className="space-y-4 pt-1">
        <FormField label={`Amount (${currencySymbol})`} required>
          <Input
            withFormField={false}
            type="number"
            required
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            prefix={<span className="font-semibold text-slate-400 select-none text-base">{currencySymbol}</span>}
            className="text-lg sm:text-xl font-bold font-mono pl-8"
          />

          <div className="grid grid-cols-4 gap-2 mt-2.5">
            {[500, 1000, 2000, 5000].map((val) => (
              <Button
                key={val}
                type="button"
                variant="outline"
                size="default"
                onClick={() => setAmount(val.toString())}
                className="w-full text-center"
              >
                +{currencySymbol}
                {val}
              </Button>
            ))}
          </div>
        </FormField>

        <FormField label="Payment Method">
          <RadioGroup
            value={paymentMethod}
            onChange={(val) => setPaymentMethod(val as "upi" | "card")}
            variant="primary"
            variantStyle="card"
          >
            <Radio
              value="upi"
              label="Instant UPI"
              description="Google Pay, PhonePe, Paytm, or BHIM"
            />
            <Radio
              value="card"
              label="Credit / Debit Card"
              description="Available via Razorpay gateway"
              disabled
            />
          </RadioGroup>
        </FormField>

        <div className="flex items-center gap-2.5 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            size="md"
            disabled={!amount || parseFloat(amount) <= 0 || isAddingUpi}
            isLoading={isAddingUpi}
            className="flex-1"
          >
            Add via UPI
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleRazorpayCheckout}
            disabled={!amount || parseFloat(amount) <= 0 || loadingRazorpay}
            isLoading={loadingRazorpay}
            className="flex-1"
          >
            Razorpay
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddMoneyModal;

