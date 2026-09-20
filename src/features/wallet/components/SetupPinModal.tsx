import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ModalWrapper, FormField } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSetupPinMutation } from "../api/walletApi";

export interface SetupPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SetupPinModal: React.FC<SetupPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState("");
  const [setupPin, { isLoading }] = useSetupPinMutation();

  useEffect(() => {
    if (!isOpen) {
      setPin("");
    }
  }, [isOpen]);

  const handleClose = () => {
    setPin("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    try {
      await setupPin({ pin }).unwrap();
      toast.success("Security PIN set successfully!");
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Failed to set PIN");
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Set Security PIN"
      description="Create a 4-digit PIN for your wallet transactions."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        <FormField label="4-Digit Security PIN" required>
          <Input
            withFormField={false}
            type="password"
            maxLength={4}
            required
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
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
            disabled={pin.length !== 4 || isLoading}
            isLoading={isLoading}
            className="flex-1"
          >
            Set PIN
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default SetupPinModal;

