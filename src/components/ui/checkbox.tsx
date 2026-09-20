import React, { useId } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, "size"> {
  // Label & Descriptions
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  error?: string | boolean;
  helperText?: React.ReactNode;

  // Size Variants
  size?: "sm" | "md" | "lg";

  // Color Variants
  variant?: "primary" | "moss" | "slate" | "danger";

  // Custom ClassNames
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
}

export const Checkbox = React.memo(
  React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    CheckboxProps
  >(
    (
    {
      className,
      containerClassName,
      labelClassName,
      descriptionClassName,
      errorClassName,
      id: customId,
      label,
      description,
      required = false,
      error,
      helperText,
      size = "md",
      variant = "primary",
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const checkboxId = customId || (label ? `checkbox-${autoId}` : undefined);

    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : undefined;

    // Sizing tokens
    const isSm = size === "sm";
    const isLg = size === "lg";

    const sizeClasses = isSm
      ? "h-4 w-4 rounded"
      : isLg
      ? "h-6 w-6 rounded-md"
      : "h-5 w-5 rounded-[5px]";

    const iconSize = isSm ? 12 : isLg ? 16 : 14;

    // Color variant styles for checked / active state
    const variantClasses = {
      primary: "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600 focus-visible:ring-blue-500/30",
      moss: "data-[state=checked]:bg-moss data-[state=checked]:border-moss data-[state=indeterminate]:bg-moss data-[state=indeterminate]:border-moss focus-visible:ring-moss/30",
      slate: "data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 data-[state=indeterminate]:bg-slate-900 data-[state=indeterminate]:border-slate-900 focus-visible:ring-slate-900/30",
      danger: "data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 data-[state=indeterminate]:bg-rose-600 data-[state=indeterminate]:border-rose-600 focus-visible:ring-rose-500/30",
    }[variant];

    const checkboxControl = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        disabled={disabled}
        checked={checked}
        className={cn(
          "peer shrink-0 border border-slate-300 bg-white shadow-2xs transition-all duration-150 outline-none select-none cursor-pointer flex items-center justify-center text-white",
          sizeClasses,
          variantClasses,
          "hover:border-slate-400 hover:bg-slate-50/50",
          "focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 disabled:shadow-none",
          hasError && "border-red-400 focus-visible:ring-red-400/30",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {checked === "indeterminate" ? (
            <Minus size={iconSize} strokeWidth={3} />
          ) : (
            <Check size={iconSize} strokeWidth={3} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    // If standalone checkbox without label/description/error, return direct element
    if (!label && !description && !errorMessage && !helperText) {
      return checkboxControl;
    }

    // Integrated Accessible Label & Description Layout
    return (
      <div className={cn("space-y-1", containerClassName)}>
        <div className={`flex gap-2.5 ${description ? "items-start" : "items-center"}`}>
          <div className="pt-0.5 shrink-0 flex items-center">{checkboxControl}</div>
          <div className={`flex-1 ${description ? "" : "mt-1"}`}>
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "text-xs font-medium text-slate-800 cursor-pointer block leading-snug",
                  disabled && "opacity-50 cursor-not-allowed",
                  labelClassName
                )}
              >
                {label} {required && <span className={`text-red-500 font-bold ml-0.5`}>*</span>}
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
        </div>

        {/* Validation Error or Helper */}
        <AnimatePresence initial={false} mode="wait">
          {errorMessage ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 4 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden ml-7"
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
              className="overflow-hidden ml-7"
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

// --- Checkbox Group ---

export interface CheckboxGroupOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  options: CheckboxGroupOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "moss" | "slate" | "danger";
  error?: string | boolean;
  helperText?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = React.memo(({
  label,
  description,
  required = false,
  options,
  value,
  defaultValue = [],
  onChange,
  orientation = "vertical",
  disabled = false,
  size = "md",
  variant = "primary",
  error,
  helperText,
  className,
  containerClassName,
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);

  const currentValues = isControlled ? value || [] : internalValue;

  const handleToggle = React.useCallback((optValue: string, checked: boolean) => {
    let next: string[];
    if (checked) {
      next = [...currentValues, optValue];
    } else {
      next = currentValues.filter((v) => v !== optValue);
    }

    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  }, [currentValues, isControlled, onChange]);

  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {(label || description) && (
        <div className="space-y-0.5">
          {label && (
            <span className="block text-xs font-semibold text-slate-700">
              {label} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
            </span>
          )}
          {description && <p className="text-[11px] text-slate-400 font-normal">{description}</p>}
        </div>
      )}

      <div
        className={cn(
          "gap-3",
          orientation === "horizontal"
            ? "flex flex-wrap items-center"
            : "flex flex-col space-y-2",
          className
        )}
      >
        {options.map((opt) => {
          const isChecked = currentValues.includes(opt.value);
          const isDisabled = disabled || opt.disabled;

          return (
            <Checkbox
              key={opt.value}
              label={opt.label}
              description={opt.description}
              checked={isChecked}
              disabled={isDisabled}
              size={size}
              variant={variant}
              onCheckedChange={(c) => handleToggle(opt.value, Boolean(c))}
            />
          );
        })}
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
            <p className="text-xs text-red-600 font-normal">
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
});

Checkbox.displayName = "Checkbox";
CheckboxGroup.displayName = "CheckboxGroup";

export default Checkbox;
