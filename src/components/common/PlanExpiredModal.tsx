import React from "react";
import { ArrowLeft, Clock3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalWrapper } from "./ModalWrapper";

interface PlanExpiredModalProps {
  isOpen: boolean;
  associationName?: string;
  state?: "expired" | "inactive";
  actionLabel?: string;
  onAction: () => void;
}

export const PlanExpiredModal: React.FC<PlanExpiredModalProps> = ({
  isOpen,
  associationName,
  state = "expired",
  actionLabel = "Sign out",
  onAction,
}) => {
  const isInactive = state === "inactive";
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={() => undefined}
      size="sm"
      hideClose
      preventOutsideClose
      closeOnOutsideClick={false}
      className="border-red-100"
      bodyClassName="p-6 text-center"
      footer={
        <Button type="button" variant="default" className="w-full sm:w-auto" onClick={onAction}>
          {actionLabel === "Sign out" ? <LogOut size={16} /> : <ArrowLeft size={16} />}
          {actionLabel}
        </Button>
      }
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <Clock3 size={28} />
      </div>
      <h2 className="text-xl font-semibold text-slate-900">
        {isInactive ? "Plan inactive" : "Plan expired"}
      </h2>
      {associationName && (
        <p className="mt-2 text-sm font-medium text-slate-700">{associationName}</p>
      )}
      <p className="mt-4 text-sm leading-6 text-slate-600">
        {isInactive
          ? "Your association plan is inactive. Please contact Nestora Admin to reactivate the plan and restore access."
          : "Your association plan has expired. Please contact Nestora Admin to renew the plan and restore access."}
      </p>
    </ModalWrapper>
  );
};
