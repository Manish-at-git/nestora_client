import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-3 overflow-hidden rounded-xl border p-4 pr-6 shadow-lg transition-all backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-white/95 text-slate-800",
        destructive: "border-rose-200 bg-rose-50/95 text-rose-900",
        success: "border-emerald-200 bg-emerald-50/95 text-emerald-950",
        warning: "border-amber-200 bg-amber-50/95 text-amber-950",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  className,
  variant,
  children,
  onClose,
  ...props
}) => {
  return (
    <div className={cn(toastVariants({ variant }), className)} {...props}>
      <div className="flex items-start gap-3">
        {variant === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
        {variant === "destructive" && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
        {variant === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
        {variant === "default" && <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />}
        <div className="flex-1">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md"
          aria-label="Close toast"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const ToastTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h5 className={cn("text-sm font-semibold tracking-tight text-slate-900", className)} {...props} />
);

export const ToastDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p className={cn("text-xs text-slate-600 mt-0.5 leading-relaxed", className)} {...props} />
);

export default Toast;
