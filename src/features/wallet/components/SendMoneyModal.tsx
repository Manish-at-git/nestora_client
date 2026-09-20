import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ModalWrapper, FormField } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSendMoneyMutation } from "../api/walletApi";
import { Wallet } from "../types";

export interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet?: Wallet | null;
  currencySymbol?: string;
  onSuccess?: () => void;
}

const PURPOSE_OPTIONS = [
  { value: "Helper Salary", label: "Helper Salary" },
  { value: "Marketplace", label: "Marketplace" },
  { value: "Personal", label: "Personal / Other" },
];

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  isOpen,
  onClose,
  wallet,
  currencySymbol = "₹",
  onSuccess,
}) => {
  const [sendEmail, setSendEmail] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendPin, setSendPin] = useState("");
  const [sendPurpose, setSendPurpose] = useState("");
  const [sendMoney, { isLoading }] = useSendMoneyMutation();

  const resetForm = () => {
    setSendEmail("");
    setSendAmount("");
    setSendPin("");
    setSendPurpose("");
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
      setSendAmount("");
      return;
    }
    if (val.startsWith("-")) return;
    if (val.includes(".")) {
      const [intPart, decPart] = val.split(".");
      if (decPart && decPart.length > 2) {
        setSendAmount(`${intPart}.${decPart.slice(0, 2)}`);
        return;
      }
    }
    setSendAmount(val);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendEmail || !sendAmount || sendPin.length !== 4) {
      toast.error("Please fill in all required fields and a 4-digit PIN");
      return;
    }

    try {
      await sendMoney({
        recipient_email: sendEmail.trim(),
        amount: parseFloat(sendAmount),
        pin: sendPin,
        purpose: sendPurpose || undefined,
      }).unwrap();

      toast.success("Money sent successfully!");
      resetForm();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Failed to send money");
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Money"
      description="Transfer funds directly to another community resident using their registered email."
      size="md"
    >
      <form onSubmit={handleSend} className="space-y-4 pt-1">
        <FormField label="Recipient Email" required>
          <Input
            withFormField={false}
            type="email"
            required
            value={sendEmail}
            onChange={(e) => setSendEmail(e.target.value)}
            placeholder="resident@example.com"
            disabled={isLoading}
          />
        </FormField>

        <FormField
          label={`Amount (${currencySymbol})`}
          required
          helperText={`Available balance: ${currencySymbol}${(wallet?.balance || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        >
          <Input
            withFormField={false}
            type="number"
            required
            min="1"
            max={wallet?.balance || 0}
            step="0.01"
            value={sendAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Purpose (Optional)">
          <Select
            options={PURPOSE_OPTIONS}
            value={sendPurpose}
            onValueChange={setSendPurpose}
            placeholder="Select Purpose"
            disabled={isLoading}
            clearable
            onClear={() => setSendPurpose("")}
          />
        </FormField>

        <FormField label="4-Digit Security PIN" required>
          <Input
            withFormField={false}
            type="password"
            maxLength={4}
            required
            value={sendPin}
            onChange={(e) => setSendPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            className="text-center font-mono tracking-[0.5em] text-lg"
            disabled={isLoading}
          />
        </FormField>

        <div className="flex items-center gap-3 pt-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            size="md"
            disabled={!sendEmail || !sendAmount || sendPin.length !== 4 || isLoading}
            isLoading={isLoading}
            className="flex-1"
          >
            Send Money
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default SendMoneyModal;

