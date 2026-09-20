import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { ModalWrapper, ModalSize } from "./ModalWrapper";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void | Promise<void>;
  onConfirm?: () => void | Promise<void>; // Alias for onDelete
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  message?: React.ReactNode; // Alias for description
  children?: React.ReactNode;
  itemName?: string;
  itemType?: string;
  consequences?: string[];
  deleteText?: string;
  confirmText?: string; // Alias for deleteText
  cancelText?: string;
  isDeleting?: boolean;
  isLoading?: boolean; // Alias for isDeleting
  isPending?: boolean; // Alias for isDeleting
  icon?: React.ReactNode;
  hideIcon?: boolean;
  size?: ModalSize;
  maxWidth?: ModalSize; // Alias for size
  permanent?: boolean;
  deleteButtonProps?: Partial<ButtonProps>;
  cancelButtonProps?: Partial<ButtonProps>;
  className?: string;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  onConfirm,
  title,
  subtitle,
  description,
  message,
  children,
  itemName,
  itemType = "item",
  consequences,
  deleteText,
  confirmText,
  cancelText = "Cancel",
  isDeleting = false,
  isLoading = false,
  isPending = false,
  icon,
  hideIcon = false,
  size = "sm",
  maxWidth,
  permanent = true,
  deleteButtonProps,
  cancelButtonProps,
  className,
}) => {
  const loading = isDeleting || isLoading || isPending;

  // Resolved titles & texts
  const resolvedTitle =
    title ||
    (permanent
      ? `Delete ${itemType ? itemType.charAt(0).toUpperCase() + itemType.slice(1) : "Item"}`
      : `Archive ${itemType ? itemType.charAt(0).toUpperCase() + itemType.slice(1) : "Item"}`);

  const resolvedDescription =
    description ||
    message ||
    subtitle ||
    (itemName ? (
      <>
        Are you sure you want to delete{" "}
        <span className="font-semibold text-slate-900">"{itemName}"</span>? This
        action cannot be undone.
      </>
    ) : (
      `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
    ));

  const resolvedDeleteText =
    deleteText ||
    confirmText ||
    (itemType
      ? `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`
      : "Delete");

  const resolvedSize = size || maxWidth || "sm";

  const handleDelete = async () => {
    if (loading) return;
    const action = onDelete || onConfirm;
    if (action) {
      await action();
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-600">
              {icon || <Trash2 size={17} className="stroke-[2.2]" />}
            </div>
          )}
          <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 tracking-tight leading-snug">
            {resolvedTitle}
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
          <div className="p-2.5 rounded-lg border bg-rose-50/50 border-rose-100 text-rose-900 text-xs space-y-1">
            <div className="flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] text-rose-700">
              <AlertTriangle size={11} className="shrink-0" />
              <span>Consequences</span>
            </div>
            <ul className="space-y-0.5 list-disc list-inside text-rose-800/90 pl-0.5">
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
            variant="outline"
            onClick={onClose}
            disabled={loading}
            {...cancelButtonProps}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={loading}
            disabled={loading}
            {...deleteButtonProps}
          >
            {loading ? "Deleting..." : resolvedDeleteText}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export const DeleteConfirmationModal = DeleteModal;
export default DeleteModal;
