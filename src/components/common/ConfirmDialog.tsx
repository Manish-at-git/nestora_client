import React from "react";
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Info,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { ModalWrapper, ModalSize } from "./ModalWrapper";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmVariant =
  | "danger"
  | "warning"
  | "primary"
  | "success"
  | "default"
  | "moss"
  | "clay";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  message?: React.ReactNode; // alias for description
  children?: React.ReactNode;
  itemName?: string;
  itemType?: string;
  consequences?: string[];
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  confirmVariant?: ButtonProps["variant"];
  cancelVariant?: ButtonProps["variant"];
  isLoading?: boolean;
  isPending?: boolean; // alias for isLoading
  icon?: React.ReactNode;
  hideIcon?: boolean;
  size?: ModalSize;
  maxWidth?: ModalSize; // alias for size
  confirmButtonProps?: Partial<ButtonProps>;
  cancelButtonProps?: Partial<ButtonProps>;
  className?: string;
}

const variantConfig: Record<
  ConfirmVariant,
  {
    icon: React.ReactNode;
    iconBg: string;
    iconText: string;
    confirmVariant: ButtonProps["variant"];
  }
> = {
  danger: {
    icon: <Trash2 size={16} className="stroke-[2.2]" />,
    iconBg: "bg-rose-50 border-rose-100",
    iconText: "text-rose-600",
    confirmVariant: "danger",
  },
  warning: {
    icon: <AlertTriangle size={16} className="stroke-[2.2]" />,
    iconBg: "bg-amber-50 border-amber-100",
    iconText: "text-amber-600",
    confirmVariant: "clay",
  },
  primary: {
    icon: <HelpCircle size={16} className="stroke-[2.2]" />,
    iconBg: "bg-blue-50 border-blue-100",
    iconText: "text-blue-600",
    confirmVariant: "primary",
  },
  success: {
    icon: <CheckCircle2 size={16} className="stroke-[2.2]" />,
    iconBg: "bg-emerald-50 border-emerald-100",
    iconText: "text-emerald-600",
    confirmVariant: "moss",
  },
  moss: {
    icon: <CheckCircle2 size={16} className="stroke-[2.2]" />,
    iconBg: "bg-emerald-50 border-emerald-100",
    iconText: "text-emerald-600",
    confirmVariant: "moss",
  },
  clay: {
    icon: <AlertCircle size={16} className="stroke-[2.2]" />,
    iconBg: "bg-amber-50 border-amber-100",
    iconText: "text-amber-600",
    confirmVariant: "clay",
  },
  default: {
    icon: <Info size={16} className="stroke-[2.2]" />,
    iconBg: "bg-slate-100 border-slate-200",
    iconText: "text-slate-700",
    confirmVariant: "default",
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  description,
  message,
  children,
  itemName,
  itemType,
  consequences,
  confirmText,
  cancelText = "Cancel",
  variant = "danger",
  confirmVariant,
  cancelVariant = "outline",
  isLoading = false,
  isPending = false,
  icon,
  hideIcon = false,
  size = "sm",
  maxWidth,
  confirmButtonProps,
  cancelButtonProps,
  className,
}) => {
  const loading = isLoading || isPending;
  const config = variantConfig[variant] || variantConfig.danger;
  const resolvedConfirmVariant = confirmVariant || config.confirmVariant;

  const resolvedConfirmText =
    confirmText ||
    (variant === "danger" ? (itemType ? `Delete ${itemType}` : "Delete") : "Confirm");

  const resolvedDescription =
    description ||
    message ||
    subtitle ||
    (itemName ? (
      <>
        Are you sure you want to proceed with{" "}
        <span className="font-semibold text-slate-900">"{itemName}"</span>?
      </>
    ) : undefined);

  const resolvedSize = size || maxWidth || "sm";

  const handleConfirm = async () => {
    if (!loading) {
      await onConfirm();
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      size={resolvedSize}
      hideClose={true}
      preventOutsideClose={loading}
      bodyClassName="p-4 sm:p-5"
      className={cn("rounded-2xl max-w-sm sm:max-w-md", className)}
    >
      <div className="space-y-3">
        {/* 1. Header with Icon & Title UP */}
        <div className="flex items-center gap-2.5">
          {!hideIcon && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                config.iconBg,
                config.iconText
              )}
            >
              {icon || config.icon}
            </div>
          )}

          <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 tracking-tight leading-snug">
            {title}
          </h3>
        </div>

        {/* 2. Body Message */}
        {resolvedDescription && (
          <div className="text-sm text-slate-600 leading-relaxed font-normal">
            {resolvedDescription}
          </div>
        )}

        {/* 3. Consequences (if any) */}
        {consequences && consequences.length > 0 && (
          <div
            className={cn(
              "p-2.5 rounded-lg border text-xs space-y-1",
              variant === "danger"
                ? "bg-rose-50/50 border-rose-100 text-rose-800"
                : "bg-amber-50/50 border-amber-100 text-amber-800"
            )}
          >
            <div className="flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] opacity-90">
              <AlertTriangle size={11} className="shrink-0" />
              <span>Consequences</span>
            </div>
            <ul className="space-y-0.5 list-disc list-inside text-[11px] opacity-90 pl-0.5">
              {consequences.map((c, idx) => (
                <li key={idx} className="leading-relaxed">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Custom Body Children */}
        {children && <div className="pt-0.5">{children}</div>}

        {/* 4. Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant={cancelVariant}
            onClick={onClose}
            disabled={loading}
            {...cancelButtonProps}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={resolvedConfirmVariant}
            onClick={handleConfirm}
            isLoading={loading}
            disabled={loading}
            {...confirmButtonProps}
          >
            {resolvedConfirmText}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export const ConfirmationModal = ConfirmDialog;
export const ConfirmModal = ConfirmDialog;
export default ConfirmDialog;
