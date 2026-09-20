import * as React from "react";
import { toast as sonnerToast } from "sonner";

export interface ToastProps {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
}

export type ToastActionElement = React.ReactElement;

/**
 * Universal toast function bridging rich sonner notifications
 * with shadcn/radix style API signatures.
 */
export function toast({
  title,
  description,
  variant = "default",
  duration = 4000,
  action,
  ...props
}: ToastProps) {
  const content = (
    <div className="flex flex-col gap-0.5">
      {title && <span className="font-semibold text-sm">{title}</span>}
      {description && <span className="text-xs text-slate-600 dark:text-slate-400">{description}</span>}
    </div>
  );

  switch (variant) {
    case "destructive":
      return sonnerToast.error(content, { duration, ...props });
    case "success":
      return sonnerToast.success(content, { duration, ...props });
    case "warning":
      return sonnerToast.warning(content, { duration, ...props });
    default:
      return sonnerToast(content, { duration, ...props });
  }
}

// Attach helper methods to toast function
toast.success = (message: string | React.ReactNode, options?: any) => sonnerToast.success(message, options);
toast.error = (message: string | React.ReactNode, options?: any) => sonnerToast.error(message, options);
toast.info = (message: string | React.ReactNode, options?: any) => sonnerToast.info(message, options);
toast.warning = (message: string | React.ReactNode, options?: any) => sonnerToast.warning(message, options);
toast.dismiss = (toastId?: string | number) => sonnerToast.dismiss(toastId);

export function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
    toasts: [],
  };
}

export default useToast;
