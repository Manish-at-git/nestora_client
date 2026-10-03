import React from "react";
import { DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisitorCheckoutButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const VisitorCheckoutButton: React.FC<VisitorCheckoutButtonProps> = ({
  disabled = false,
  onClick,
}) => (
  <Button type="button" size="sm" disabled={disabled} onClick={onClick}>
    <DoorOpen size={14} /> Check Out
  </Button>
);

export default VisitorCheckoutButton;
