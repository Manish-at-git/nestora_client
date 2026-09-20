import React from "react";
import { ModalWrapper, ModalWrapperProps } from "./ModalWrapper";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FormModalProps
  extends Omit<ModalWrapperProps, "footer" | "children"> {
  children: React.ReactNode;

  // Form submission handler
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;

  // Submitting / Loading state
  isSubmitting?: boolean;
  isLoading?: boolean; // alias for isSubmitting

  // Primary Submit Button configuration
  submitText?: React.ReactNode;
  loadingText?: React.ReactNode;
  submitVariant?:
    | "default"
    | "primary"
    | "moss"
    | "clay"
    | "outline"
    | "secondary"
    | "ghost"
    | "danger";
  submitDisabled?: boolean;
  submitIcon?: React.ReactNode;
  submitButtonProps?: Partial<ButtonProps>;

  // Secondary Cancel Button configuration
  cancelText?: React.ReactNode;
  cancelVariant?:
    | "default"
    | "primary"
    | "moss"
    | "clay"
    | "outline"
    | "secondary"
    | "ghost"
    | "danger";
  onCancel?: () => void;
  showCancel?: boolean;
  cancelButtonProps?: Partial<ButtonProps>;

  // Extra / Custom Actions
  extraActions?: React.ReactNode; // Extra buttons on left (e.g., Delete, Draft, Reset)
  customFooter?: React.ReactNode; // Complete override for the footer
  footer?: React.ReactNode; // Alias for customFooter

  // Form wrapper control
  isForm?: boolean; // Default true. If false, renders as non-form layout
  formProps?: Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit">;
  formClassName?: string;
  contentClassName?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  subheader,
  subtitle,
  icon,
  badge,
  children,
  size = "2xl",
  maxWidth,
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
  hideClose = false,
  preventOutsideClose = false,
  closeOnOutsideClick = true,

  // Form submission
  onSubmit,
  isSubmitting = false,
  isLoading = false,

  // Submit button
  submitText = "Save Changes",
  loadingText = "Saving Changes...",
  submitVariant = "default",
  submitDisabled = false,
  submitIcon,
  submitButtonProps,

  // Cancel button
  cancelText = "Cancel",
  cancelVariant = "outline",
  onCancel,
  showCancel = true,
  cancelButtonProps,

  // Custom actions & footer
  extraActions,
  customFooter,
  footer,

  // Form tag
  isForm = true,
  formProps,
  formClassName,
  contentClassName,
}) => {
  const isPending = isSubmitting || isLoading;
  const handleCancel = onCancel || onClose;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit && !isPending && !submitDisabled) {
      onSubmit(e);
    }
  };

  const resolvedFooter = customFooter || footer;

  const defaultActionButtons = (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 w-full",
        !extraActions && "sm:justify-end"
      )}
    >
      {extraActions && (
        <div className="flex items-center gap-2 w-full sm:w-auto">{extraActions}</div>
      )}

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:ml-auto w-full sm:w-auto">
        {showCancel && (
          <Button
            type="button"
            variant={cancelVariant}
            onClick={handleCancel}
            disabled={isPending}
            className="w-full sm:w-auto"
            {...cancelButtonProps}
          >
            {cancelText}
          </Button>
        )}

        <Button
          type={isForm ? "submit" : "button"}
          variant={submitVariant}
          isLoading={isPending}
          disabled={submitDisabled || isPending}
          className="w-full sm:w-auto"
          onClick={
            !isForm
              ? () => onSubmit?.(undefined as unknown as React.FormEvent<HTMLFormElement>)
              : undefined
          }
          {...submitButtonProps}
        >
          {isPending && loadingText ? (
            loadingText
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              {submitIcon}
              {submitText}
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      subheader={subheader}
      subtitle={subtitle}
      icon={icon}
      badge={badge}
      size={size}
      maxWidth={maxWidth}
      className={className}
      bodyClassName={cn("p-0 overflow-hidden flex flex-col flex-1", bodyClassName)}
      headerClassName={headerClassName}
      footerClassName={footerClassName}
      hideClose={hideClose}
      preventOutsideClose={preventOutsideClose || isPending}
      closeOnOutsideClick={closeOnOutsideClick}
    >
      {isForm ? (
        <form
          noValidate
          onSubmit={handleSubmit}
          className={cn("flex flex-col flex-1 min-h-0", formClassName)}
          {...formProps}
        >
          {/* Scrollable Form Content Area */}
          <div
            className={cn(
              "p-6 pt-3 overflow-y-auto flex-1 overscroll-contain space-y-4",
              contentClassName
            )}
          >
            {children}
          </div>

          {/* Form Action Footer */}
          <div
            className={cn(
              "flex items-center px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0",
              footerClassName
            )}
          >
            {resolvedFooter || defaultActionButtons}
          </div>
        </form>
      ) : (
        <div className={cn("flex flex-col flex-1 min-h-0", formClassName)}>
          {/* Scrollable Non-Form Content Area */}
          <div
            className={cn(
              "p-6 pt-3 overflow-y-auto flex-1 overscroll-contain space-y-4",
              contentClassName
            )}
          >
            {children}
          </div>

          {/* Action Footer */}
          <div
            className={cn(
              "flex items-center px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0",
              footerClassName
            )}
          >
            {resolvedFooter || defaultActionButtons}
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default FormModal;
