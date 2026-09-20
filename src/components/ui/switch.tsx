import React, { useId } from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>, "size"> {
  // Label & Form integration
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  error?: string | boolean;
  helperText?: React.ReactNode;

  // Size Variants
  size?: "sm" | "md" | "lg";

  // Color Theme Variants
  variant?: "primary" | "moss" | "slate" | "danger" | "success";

  // Icons inside Thumb
  thumbIcon?: React.ReactNode;
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;

  // Custom ClassNames
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
}

export const Switch = React.memo(
  React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    SwitchProps
  >(
    (
    {
      className,
      containerClassName,
      labelClassName,
      descriptionClassName,
      errorClassName,
      label,
      description,
      required = false,
      error,
      helperText,
      size = "md",
      variant = "primary",
      thumbIcon,
      checkedIcon,
      uncheckedIcon,
      disabled,
      checked,
      id: customId,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const switchId = customId || (label ? `switch-${autoId}` : undefined);

    const isSm = size === "sm";
    const isLg = size === "lg";

    // Track Sizing (standard Tailwind classes with precise dimensions)
    const trackSize = isSm
      ? "h-4 w-7 p-0.5"
      : isLg
      ? "h-7 w-12 p-0.5"
      : "h-6 w-11 p-0.5";

    // Thumb Sizing and Translation
    const thumbSize = isSm
      ? "h-3 w-3 data-[state=checked]:translate-x-3"
      : isLg
      ? "h-6 w-6 data-[state=checked]:translate-x-5"
      : "h-5 w-5 data-[state=checked]:translate-x-5";

    // Color Theme Classes
    const activeColorClasses = {
      primary: "data-[state=checked]:bg-blue-600 focus-visible:ring-blue-500/30",
      moss: "data-[state=checked]:bg-moss focus-visible:ring-moss/30",
      slate: "data-[state=checked]:bg-slate-900 focus-visible:ring-slate-900/30",
      danger: "data-[state=checked]:bg-rose-600 focus-visible:ring-rose-500/30",
      success: "data-[state=checked]:bg-emerald-600 focus-visible:ring-emerald-500/30",
    }[variant];

    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : undefined;

    const switchControl = (
      <SwitchPrimitives.Root
        ref={ref}
        id={switchId}
        disabled={disabled}
        checked={checked}
        className={cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none select-none",
          "bg-slate-200 data-[state=unchecked]:hover:bg-slate-300/80",
          "focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-slate-200",
          trackSize,
          activeColorClasses,
          hasError && "data-[state=unchecked]:bg-rose-200 data-[state=checked]:bg-rose-600",
          className
        )}
        {...props}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none flex items-center justify-center rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-out data-[state=unchecked]:translate-x-0 text-slate-600",
            thumbSize
          )}
        >
          {thumbIcon || (
            <>
              {checked && checkedIcon && <span className="scale-75">{checkedIcon}</span>}
              {!checked && uncheckedIcon && <span className="scale-75">{uncheckedIcon}</span>}
            </>
          )}
        </SwitchPrimitives.Thumb>
      </SwitchPrimitives.Root>
    );

    // If standalone without label and description, return direct switch
    if (!label && !description && !errorMessage && !helperText) {
      return switchControl;
    }

    // Inline Label + Description Layout
    return (
      <div className={cn("space-y-1 w-full", containerClassName)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            {label && (
              <label
                htmlFor={switchId}
                className={cn(
                  "text-xs font-medium text-slate-800 cursor-pointer block leading-snug",
                  disabled && "opacity-50 cursor-not-allowed",
                  labelClassName
                )}
              >
                {label} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
              </label>
            )}
            {description && (
              <p
                className={cn(
                  "text-[11px] text-slate-400 font-normal leading-normal mt-0.5",
                  disabled && "opacity-50",
                  descriptionClassName
                )}
              >
                {description}
              </p>
            )}
          </div>
          {switchControl}
        </div>

        <AnimatePresence initial={false} mode="wait">
          {errorMessage ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 4 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p
                className={cn(
                  "text-xs text-red-600 font-normal",
                  errorClassName
                )}
              >
                {errorMessage}
              </p>
            </motion.div>
          ) : helperText ? (
            <motion.div
              key="helper"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 4 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <p className="text-xs text-slate-400 font-normal">{helperText}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
)
);

Switch.displayName = "Switch";
export default Switch;
