import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModalSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";

export const modalSizeClasses: Record<ModalSize, string> = {
  xs: "max-w-xs sm:max-w-xs",
  sm: "max-w-sm sm:max-w-sm",
  md: "max-w-md sm:max-w-md",
  lg: "max-w-lg sm:max-w-lg",
  xl: "max-w-xl sm:max-w-xl",
  "2xl": "max-w-2xl sm:max-w-2xl",
  "3xl": "max-w-3xl sm:max-w-3xl",
  "4xl": "max-w-4xl sm:max-w-4xl",
  "5xl": "max-w-5xl sm:max-w-5xl",
  full: "max-w-[calc(100vw-2rem)] sm:max-w-6xl",
};

export interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  subheader?: React.ReactNode; // alias for description
  subtitle?: React.ReactNode; // alias for description
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  maxWidth?: ModalSize;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  hideClose?: boolean;
  preventOutsideClose?: boolean;
  closeOnOutsideClick?: boolean;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  description,
  subheader,
  subtitle,
  icon,
  badge,
  children,
  footer,
  size = "2xl",
  maxWidth,
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
  hideClose = false,
  preventOutsideClose = false,
  closeOnOutsideClick = true,
}) => {
  const resolvedSubheader = subheader || subtitle || description;
  const resolvedSize = size || maxWidth || "2xl";
  const sizeClass = modalSizeClasses[resolvedSize] || modalSizeClasses["2xl"];

  const handlePointerDownOutside = (e: CustomEvent) => {
    if (preventOutsideClose || !closeOnOutsideClick) {
      e.preventDefault();
    }
  };

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        {/* Hardware-Accelerated Overlay with Smooth Fade */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs",
            "duration-200 transition-all",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />

        {/* Modal Container with Smooth Spring Zoom & Slide */}
        <DialogPrimitive.Content
          onPointerDownOutside={handlePointerDownOutside}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 flex flex-col w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%]",
            "max-h-[92vh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden outline-none",
            "duration-200 ease-out",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            sizeClass,
            className
          )}
        >
          {/* Header */}
          {title || resolvedSubheader || icon ? (
            <div
              className={cn(
                "flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/60 shrink-0",
                headerClassName
              )}
            >
              <div className="flex items-center gap-3 pr-6 min-w-0">
                {icon && (
                  <div className="flex h-8.5 w-8.5 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white border border-slate-200/80 text-slate-700 shadow-xs shrink-0">
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {title && (
                      <DialogPrimitive.Title className="text-base sm:text-lg font-bold font-display text-slate-900 tracking-tight leading-snug truncate">
                        {title}
                      </DialogPrimitive.Title>
                    )}
                    {badge && <div>{badge}</div>}
                  </div>
                  {resolvedSubheader && (
                    <DialogPrimitive.Description className="text-xs text-slate-500 font-normal leading-relaxed mt-0.5 line-clamp-2">
                      {resolvedSubheader}
                    </DialogPrimitive.Description>
                  )}
                </div>
              </div>

              {!hideClose && (
                <DialogPrimitive.Close
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer shrink-0 -mr-1 outline-none focus:outline-none"
                >
                  <X size={18} />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </div>
          ) : (
            <DialogPrimitive.Title className="sr-only">Modal</DialogPrimitive.Title>
          )}

          {/* Content Body */}
          <div
            className={cn(
              "p-6 overflow-y-auto flex-1 overscroll-contain text-slate-700",
              bodyClassName
            )}
          >
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div
              className={cn(
                "flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/60 shrink-0",
                footerClassName
              )}
            >
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default ModalWrapper;
